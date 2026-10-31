import os
from pathlib import Path

import yaml
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

with open(ROOT / "config.yaml", encoding="utf-8") as f:
    CFG = yaml.safe_load(f)

DB_PATH = ROOT / "data" / "pipeline.db"
LAWS_DIR = ROOT / "data" / "laws"
OUT_DIR = ROOT / "out"
OUT_DIR.mkdir(exist_ok=True)


def env(name: str, default: str = "") -> str:
    return os.environ.get(name, default)


DEMO = env("PIPELINE_DEMO", "0") == "1" or not env("LLM_API_KEY")
