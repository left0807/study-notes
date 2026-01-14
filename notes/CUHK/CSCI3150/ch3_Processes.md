# Processes
:abstraction of execution

## Processes state
- running: Executing the instructions on the CPU
- ready: waiting to be assigned to CPU
- waiting: waiting for an event, e.g. IO

Unix: `ps` STAT column indicates execition state

## Memory Space
- For same program, differnt process has same address
- Virtual memory -> memory mapping

```
----------- 0xffffffff
  Stack          ^
-----------      |
    |            |
    v            |
                 |
    ^            |
    |            |
-----------      |
    Heap         |
-----------      |
static data      |
-----------      |
    code         v
----------- 0x00000000
```

## Process Data Structure
- Process Control Block(PCB)
- Contain a lot of information


## Context Switch

### State Queue
- OS maintain a queue for each state (ready queue, waiting queue, etc)
- Each PCB is queued on a state queue according to its current staet


