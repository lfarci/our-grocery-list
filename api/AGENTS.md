# API Agent Instructions

- Follow `.github/copilot-instructions.md` to keep API behavior aligned with the grocery list requirements and simplified flows.
- Apply the C# Copilot guidance in `.github/instructions/csharp.instructions.md` when working in this directory so code conventions stay consistent.
- Keep the API narrowly focused on a single shared grocery list; avoid introducing concepts like accounts, rooms, or multiple lists.
- Maintain clear, minimal request/response contracts; prefer straightforward endpoints over additional layers of abstraction.
- Apply stricter instructions from nested `AGENTS.md` files if present within the API directory.
