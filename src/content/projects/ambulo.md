---
title: "Ambulo"
description: "Jointed creatures evolve to walk, climb stairs and chase a lure. Every limb runs its own neural network, a genetic algorithm scores thousands of them in a WebAssembly physics engine, and the whole thing runs in the browser with no server and no AI API."
techStack: ["TypeScript", "React", "Three.js", "Rapier", "Web Workers", "Vite"]
githubUrl: "https://github.com/asgerami/ambulo"
demoUrl: "https://asgerami.github.io/ambulo/"
featured: true
order: 0
year: "2026"
image: "../../assets/projects/ambulo.webp"
---

Ambulo evolves jointed creatures from scratch. Each one is a box torso with capsule
limbs, and each limb is driven by its own tiny neural network. A genetic algorithm
scores thousands of them in a rigid-body physics engine, keeps the ones that do best,
mutates their bodies and their brains, and repeats. Generation one flops around. A few
minutes later something is running.

Nothing leaves the machine it runs on. Physics happens in Web Workers, there is no
backend, no account, and no model API.

## Bodies and brains evolve together

A genome is a tree of limb genes hanging off a torso. A gene stores where it attaches to
its parent, the direction it points at rest, its length and radius, a hinge axis and joint
limit, and a `mirror` flag. Mirrored genes are instantiated twice, reflected across the
midline, and the two copies share one controller with a phase offset. That bias toward
bilateral symmetry is why recognisable gaits, trots and bounds and hops, show up so fast.

Mutation touches three things: weights get small Gaussian noise, geometry gets log-normal
scaling, and structure can add a limb, remove a leaf, or toggle mirroring. Crossover is
uniform per gene and only runs between parents that share a body plan.

## One brain per limb, not one per creature

Every limb gene carries its own 15-6-1 multilayer perceptron. It reads local
proprioception (its joint angle and angular velocity, ground contact, the parent joint's
angle), whole-body state (torso up vector, forward speed), a shared central pattern
generator clock, where the target sits relative to the body, a bias, and its own previous
output. It writes a target joint angle that a position motor tracks.

The reason to distribute it: adding or removing a limb never invalidates the rest of the
brain, so structural mutations stay cheap and mostly survivable. One monolithic network
would have to be rebuilt every time the body changed.

Steering falls out of the same trick that produces symmetry. A mirrored twin shares its
weights with the original, so it is handed a mirrored world instead: every left/right
input is negated for it. A target on the left reads as positive lateral to one leg and
negative to the other, identical weights produce opposite outputs, and the creature turns.
That is what makes chase mode work without doubling the genome.

## Courses and objectives

There are five courses, flat, hills, stairs, gaps and hurdles, each flat around the start
line and harder with distance. Falling into a pit ends the trial. Changing the course
mid-run forces the population to adapt, and the fitness chart usually dips before climbing
back with a different body plan.

Two objectives. Sprint scores distance along the track. Chase scores progress toward
waypoints that jump to a new random direction every few seconds, which is what teaches
steering. In the arena, hovering the mouse over the ground turns it into a glowing lure
the whole pack follows.

## Keeping the population from collapsing

Without intervention one lineage takes over inside a couple of hundred generations. The
first body plan to find a workable gait out-scores every rival before those rivals have had
time to learn theirs, and by generation 300 everything is the same two-legged bounder.

The fix, in the spirit of NEAT, is speciation: a compatibility distance dominated by body
plan, species assignment against the previous generation's champions with a threshold that
drifts to hold the species count near a target, and explicit fitness sharing so a large
species has to be proportionally better to earn the same number of offspring. Species that
stop improving for 25 generations are culled.

Measured over 60 generations on flat ground, body-plan diversity rose from a Shannon
entropy of 0.29 to 1.45 while best fitness stayed comparable. Diversity is the point: it
buys the run more shots at a good design. It can be toggled off in the panel to watch the
monoculture come back.

## What you watch is what was scored

The timestep is fixed and Rapier is deterministic, so the arena never needs trajectories
back from the workers. It rebuilds each creature from its genome, the course and the
per-generation waypoint seed, then re-simulates in a private world. What plays on screen is
bit-for-bit the run that earned the fitness, and there is a test that holds that line. The
mouse-driven lure is the one deliberate exception.

The population is dealt round-robin to a worker pool sized to `hardwareConcurrency - 1`,
so the UI thread only ever renders. Sharing encodes the current best creature into the URL,
which means anyone can open it, watch it, and keep evolving from where it left off.
