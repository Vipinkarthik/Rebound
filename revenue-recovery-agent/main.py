"""
Revenue Recovery Agent — main orchestrator.

Pipeline per event:
    Detector (just reads the event stream) ->
    Diagnoser (raw error -> reason code) ->
    Strategist (reason code + case state + policy -> decision) ->
    Executor (carries out the decision, simulates outcome) ->
    Audit logger (writes the full trail)

Run:
    python main.py --events data/events.json --policy policy/rules.yaml
"""

import argparse
import json
from collections import defaultdict
from datetime import datetime

import yaml

from agents import diagnoser, strategist, executor
from audit import logger as audit_logger


def load_policy(path: str) -> dict:
    with open(path) as f:
        return yaml.safe_load(f)


def run(events_path: str, policy_path: str, audit_path: str, results_path: str):
    with open(events_path) as f:
        events = json.load(f)

    policy = load_policy(policy_path)

    # reset audit log for a clean run
    open(audit_path, "w").close()

    total_at_risk = 0.0
    total_recovered = 0.0
    stopped_count = 0
    deferred_count = 0
    acted_count = 0
    by_reason = defaultdict(lambda: {"count": 0, "recovered": 0.0, "at_risk": 0.0})

    for event in events:
        amount = event["payload"]["amount"]
        total_at_risk += amount

        # --- Detector: in a live system this is the webhook receiver.
        # Here the event is already "detected" by virtue of being in the batch.

        # --- Diagnoser
        diag = diagnoser.diagnose(event["payload"]["raw_error_description"])

        # --- Strategist
        timestamp = datetime.fromisoformat(event["created_at"])
        decision = strategist.decide(diag["reason_code"], event, timestamp, policy)

        # --- Executor
        result = executor.execute(decision, event)

        # --- Audit
        audit_logger.write_record(audit_path, event, diag, decision, result)

        # --- Tally
        total_recovered += result["amount_recovered"]
        by_reason[diag["reason_code"]]["count"] += 1
        by_reason[diag["reason_code"]]["at_risk"] += amount
        by_reason[diag["reason_code"]]["recovered"] += result["amount_recovered"]

        if decision["decision"] == "stop":
            stopped_count += 1
        elif decision["decision"] == "deferred":
            deferred_count += 1
        else:
            acted_count += 1

    summary = {
        "total_events": len(events),
        "total_at_risk_inr": round(total_at_risk, 2),
        "total_recovered_inr": round(total_recovered, 2),
        "recovery_rate_pct": round(100 * total_recovered / total_at_risk, 2) if total_at_risk else 0,
        "cases_acted_on": acted_count,
        "cases_deferred_quiet_hours": deferred_count,
        "cases_stopped_by_compliance": stopped_count,
        "by_reason_code": {
            k: {
                "count": v["count"],
                "at_risk_inr": round(v["at_risk"], 2),
                "recovered_inr": round(v["recovered"], 2),
                "recovery_rate_pct": round(100 * v["recovered"] / v["at_risk"], 2) if v["at_risk"] else 0,
            }
            for k, v in by_reason.items()
        },
    }

    with open(results_path, "w") as f:
        json.dump(summary, f, indent=2)

    print(json.dumps(summary, indent=2))
    print(f"\nFull audit trail written to: {audit_path}")
    print(f"Summary written to: {results_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--events", default="data/events.json")
    parser.add_argument("--policy", default="policy/rules.yaml")
    parser.add_argument("--audit", default="data/audit_log.jsonl")
    parser.add_argument("--results", default="data/results_summary.json")
    args = parser.parse_args()

    run(args.events, args.policy, args.audit, args.results)
