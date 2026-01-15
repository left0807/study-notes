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

# int fork(void)

- Creates and initialize a new PCB
- Create a new address soace 
- Initialize the address space with a copy of the entire contents of the parents's address space (exact duplicated of parent)
- Initialize the kernel resourecs to point to the resource used by parent (e.g. open files)
- PLace the PCB on the ready queue

- A fork call returns twice
- Returns the child's PID to the parent, "0" to the child

## Visual Illustration of fork()

```

```

## Why fork
- Is cooperating with the parent
- Relies upon the parent's data to accomplish its task

```cpp
while(1){
    int sock = accept();
    if((returned_pid = fork()) == 0){
        // Handle client request
    }
```

## How can fork differently
- A: Integer return value use EAX for 32-bit archetectire
- B: PCB stores the states of all registers
- A + B =>
```
child->PCB[return_value_register] = 0;
parent->PCB[return_value_register] = child_pid
```

# int exec(char* prog, char* argv[])

- Stop the current process (Systemcall)
- Loads the program "prog" into the process'  address space
- Initializes hardware context and args for the new program
- Place PCB onto the waiting queue



