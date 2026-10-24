---
title: "cellvm"
description: "A compact stack bytecode VM in Rust with an explicit load, verify, link, execute pipeline. A safe verifier proves the invariants that the executor's unsafe fast paths rely on, and four fuzz harnesses try to break them."
techStack: ["Rust", "Fuzzing", "ClusterFuzzLite"]
githubUrl: "https://github.com/asgerami/cellvm"
year: "2026"
---

A compact stack bytecode VM with a verifier written in safe Rust and an executor whose
`unsafe` fast paths depend on the invariants that verifier establishes. Tooling covers
disassembly, CFG construction, stack maps and static analysis, with fuzz harnesses for
loading, type flow, deserialization and assembly.
