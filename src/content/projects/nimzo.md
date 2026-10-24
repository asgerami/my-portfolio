---
title: "Nimzo"
description: "A chess engine built from scratch: an AlphaZero-style ResNet with PUCT Monte Carlo Tree Search, a binary training-data pipeline, a UCI interface and a desktop GUI. No borrowed engine code and no pretrained weights."
techStack: ["Python", "PyTorch", "MCTS", "UCI", "Kaggle T4"]
githubUrl: "https://github.com/asgerami/nimzo"
featured: true
order: 2
year: "2026"
role: "Solo build"
image: "../../assets/projects/nimzo.webp"
---

Nimzo is a chess engine built from the ground up: board and move encoding, a binary
training-data pipeline, an AlphaZero-style policy/value network, PUCT Monte Carlo Tree
Search, a UCI interface, a terminal client and a desktop GUI. There is no existing engine
code in it and no pretrained weights. The network is distilled from scratch on Lichess
puzzles and Stockfish evaluations.

It currently plays at roughly 800 to 1000 Elo: basic tactical awareness, sensible
development, and working endgame mechanics. Training is ongoing.

## Two data sources, mixed on purpose

Puzzles alone give a sharp tactical policy and almost no usable value signal, because
every puzzle position carries the same fixed win-probability label. Stockfish-evaluated
positions from the Lichess eval database add real centipawn scores, which is what lets
the value head tell a winning position from a losing one.

The two sources are mixed with a fixed sampling ratio rather than concatenated. Plain
concatenation lets the larger source drown out the smaller one, whatever split was
intended.

## Packing positions into 40 bytes

Positions are streamed straight from the compressed Lichess dumps and packed into
40-byte binary shards, so millions of training samples fit in memory on an 8 GB laptop
and the eval database never has to be downloaded in full first.

## Training on borrowed hardware

The first version trained on a laptop with 8 GB of RAM and no GPU, and took more than six
hours. The current run trains on a free Kaggle T4 with a cosine learning-rate schedule and
warmup. CPU-only training still works for smaller runs.

## Measuring it honestly

Strength is measured with cutechess-cli gauntlets against node-limited Stockfish and
rated with Ordo, and the match records are kept in the repository. The number on this
page comes from those games, not from a guess.
