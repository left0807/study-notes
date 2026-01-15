# **Processes: Abstraction of Execution**

## **Process States**

A process can exist in one of three fundamental states:

| State | Description | Unix `ps` STAT Code |
|-------|-------------|---------------------|
| **Running** | Currently executing instructions on CPU | `R` (Running or Runnable) |
| **Ready** | Waiting to be assigned to CPU | `R` (same as Running) |
| **Waiting/Blocked** | Waiting for an event (e.g., I/O completion) | `S` (Sleeping), `D` (Uninterruptible sleep), `T` (Stopped) |

### **State Transition Diagram**
```
      ┌─────────────────┐
      │     Created     │
      └────────┬────────┘
               │ fork()
               ▼
      ┌─────────────────┐   Schedule    ┌─────────────────┐
      │     Ready       │───────────────>    Running      │
      └────────┬────────┘               └────────┬────────┘
         ▲     │         Preempt or Yield           │ I/O Request or Wait
         │     ▼                                     ▼
      ┌─────────────────┐   I/O Complete    ┌─────────────────┐
      │   Waiting/      │<──────────────────│                 │
      │   Blocked       │                   │                 │
      └─────────────────┘                   └─────────────────┘
```

## **Process Memory Space**

Each process has its own virtual address space with a standardized layout:

```
┌──────────────────────────────────────┐ 0xffffffff
│               Stack                  │
│                │                     │
│                ▼ Grows downward      │
│                                      │
│                ...                   │
│                                      │
│                ▲ Grows upward        │
│                │                     │
│               Heap                   │
├──────────────────────────────────────┤
│           Static/Global Data         │
│          (Initialized & BSS)         │
├──────────────────────────────────────┤
│               Code/Text              │
│            (Executable)              │
└──────────────────────────────────────┘ 0x00000000
```

**Key Points:**
- Different processes have **same virtual addresses** but map to **different physical memory**
- Virtual memory enables memory protection and efficient sharing
- Stack grows downward, heap grows upward

## **Process Control Block (PCB)**

The PCB is the kernel's data structure that represents a process:

```
┌─────────────────────────────────────────────────────┐
│             Process Control Block (PCB)              │
├─────────────────────────────────────────────────────┤
│  Process ID (PID)         │  Parent PID (PPID)      │
├─────────────────────────────────────────────────────┤
│  Process State            │  Priority               │
├─────────────────────────────────────────────────────┤
│  Program Counter          │  CPU Registers          │
├─────────────────────────────────────────────────────┤
│  Memory Management Info   │  (Page tables, limits)  │
├─────────────────────────────────────────────────────┤
│  I/O Status Info          │  (Open files, devices)  │
├─────────────────────────────────────────────────────┤
│  Accounting Info          │  (CPU time used, etc.)  │
├─────────────────────────────────────────────────────┤
│  Scheduling Info          │  (Queue pointers, etc.) │
└─────────────────────────────────────────────────────┘
```

## **Context Switching**

### **State Queues**
The OS maintains queues for each process state:
- **Ready Queue**: Processes ready to execute
- **Wait Queues**: Processes waiting for specific events (I/O, signals, etc.)
- **Device Queues**: Processes waiting for specific devices

```
┌─────────────────────────────────────────────────────┐
│               Process State Queues                  │
├─────────────────────────────────────────────────────┤
│  Ready Queue:  [P1] → [P3] → [P5] → NULL            │
├─────────────────────────────────────────────────────┤
│  Disk Wait Queue: [P2] → [P4] → NULL                │
├─────────────────────────────────────────────────────┤
│  Network Wait Queue: [P6] → NULL                    │
└─────────────────────────────────────────────────────┘
```

### **Context Switch Mechanism**
```
┌─────────────────────────────────────────────────────┐
│             Context Switch Sequence                 │
├─────────────────────────────────────────────────────┤
│ 1. Save state of current process to its PCB         │
│    • Program counter, registers, flags              │
│    • Memory management info                         │
│                                                     │
│ 2. Update process state (Running → Ready/Wait)      │
│    • Move PCB to appropriate queue                  │
│                                                     │
│ 3. Select next process to run (scheduler decision)  │
│    • Remove from Ready Queue                        │
│                                                     │
│ 4. Load new process state from its PCB              │
│    • Restore registers, program counter             │
│    • Update memory management unit                  │
│                                                     │
│ 5. Set process state to Running                     │
│                                                     │
│ 6. Jump to restored program counter                 │
└─────────────────────────────────────────────────────┘
```

## **The `fork()` System Call**

### **What `fork()` Does**
```c
#include <unistd.h>
pid_t fork(void);
```

Creates a new child process that is an **exact duplicate** of the parent:

1. **Creates and initializes** a new PCB
2. **Creates a new address space**
3. **Copies** entire parent's address space contents
4. **Shares** kernel resources (open files, etc.)
5. **Places** PCB on the ready queue

### **Return Behavior**
- **Returns twice**: Once in parent, once in child
- **To parent**: Returns child's PID (> 0)
- **To child**: Returns 0
- **On error**: Returns -1 to parent

### **Visual Illustration of `fork()`**
```
┌─────────────────────────────────────────────────────┐
│              Before fork()                          │
├─────────────────────────────────────────────────────┤
│ Parent Process:                                     │
│   PID: 1001                                         │
│   Code: printf("Before fork\n");                    │
│         pid = fork();                               │
│         if (pid == 0) { /* child */ }               │
│         else { /* parent */ }                       │
└─────────────────────────────────────────────────────┘
                        │
                        │ fork() system call
                        ▼
┌──────────────────────────────────────────────────────┐
│              After fork()                            │
├──────────────────────────────────────────────────────┤
│ Parent Process:                    Child Process:    │
│   PID: 1001                        PID: 1002         │
│   Return value: 1002 (child PID)   Return value: 0   │
│   State: Running                   State: Ready      │
│   Same code, same PC               Same code, same PC│
│   Same open files                  Same open files   │
│   Independent memory               Copy of parent's  │
│     (copy-on-write)                  memory          │
└──────────────────────────────────────────────────────┘
```

### **Implementation Mechanism**
The different return values are achieved by manipulating the PCB:
```
┌─────────────────────────────────────────────────────┐
│         How fork() Returns Different Values         │
├─────────────────────────────────────────────────────┤
│ Parent Process PCB:           Child Process PCB:    │
│ ┌─────────────────┐           ┌─────────────────┐   │
│ │ PID: 1001       │           │ PID: 1002       │   │
│ │ Registers:      │           │ Registers:      │   │
│ │   EAX = 1002    │<─fork()──>│   EAX = 0       │   │
│ │   ...           │           │   ...           │   │
│ └─────────────────┘           └─────────────────┘   │
│ • Kernel sets return register = child's PID         │
│ • Kernel sets child's return register = 0           │
│ • Both processes resume with different EAX values   │
└─────────────────────────────────────────────────────┘
```

## **Practical Use of `fork()`**

### **Server Pattern: Forking to Handle Clients**
```c
// Typical server design using fork()
while (1) {
    // Wait for incoming connection
    int client_sock = accept(server_sock, NULL, NULL);
    
    // Create child process to handle client
    pid_t pid = fork();
    
    if (pid == 0) {
        // Child process: Handle client request
        close(server_sock);  // Child doesn't need listener
        handle_client(client_sock);
        close(client_sock);
        exit(0);  // Child exits after handling client
    } else if (pid > 0) {
        // Parent process: Continue accepting connections
        close(client_sock);  // Parent doesn't need client socket
    } else {
        // fork() failed
        perror("fork failed");
        close(client_sock);
    }
}
```

### **Why Use `fork()`?**
1. **Cooperation with parent**: Child can use parent's established state
2. **Isolation**: Child failures don't affect parent
3. **Parallelism**: Multiple clients served simultaneously
4. **Simplicity**: Clean separation of concerns

## **The `exec()` System Call**

### **What `exec()` Does**
```c
#include <unistd.h>
int execve(const char *pathname, char *const argv[], 
           char *const envp[]);
```

Replaces the current process with a new program:

1. **Stops** the current process
2. **Loads** new program into process address space
3. **Initializes** hardware context and arguments
4. **Starts execution** of new program from its entry point

### **Key Characteristics**
- **No new process created** (PID remains same)
- **Current process image destroyed** (code, data, stack, heap)
- **Only returns on error** (successful exec never returns)
- **Preserves**: PID, PPID, open file descriptors (unless marked close-on-exec)

### **Common `exec()` Family Functions**
```c
execl("/bin/ls", "ls", "-l", NULL);      // List arguments
execv("/bin/ls", (char*[]){"ls", "-l", NULL}); // Array of arguments
execle("/bin/ls", "ls", "-l", NULL, envp); // With environment
execvp("ls", (char*[]){"ls", "-l", NULL}); // Search PATH
```

### **Typical `fork()` + `exec()` Pattern**
```c
pid_t pid = fork();
if (pid == 0) {
    // Child process: Replace with new program
    execl("/bin/ls", "ls", "-l", NULL);
    
    // If exec succeeds, this code never runs
    perror("exec failed");
    exit(1);
} else if (pid > 0) {
    // Parent process: Wait for child to complete
    wait(NULL);
    printf("Child completed\n");
}
```

## **Complete Process Creation Flow**

```
┌─────────────────────────────────────────────────────┐
│          Process Creation: fork() + exec()          │
└─────────────────────────────────────────────────────┘
                        │
┌───────────────────────┼───────────────────────┐
│     Parent Process    │     Child Process     │
├───────────────────────┼───────────────────────┤
│ 1. Call fork()        │ 1. Created as clone   │
│                       │    of parent          │
│ 2. Receives child PID │ 2. Receives 0         │
│    (pid > 0)          │    (pid == 0)         │
│                       │                       │
│ 3. Continues execution│ 3. Calls exec()       │
│                       │    • Old image        │
│                       │      replaced         │
│                       │    • New program      │
│                       │      loaded           │
│                       │    • Starts from      │
│                       │      main()           │
│                       │                       │
│ 4. May wait for child │ 4. Runs independently │
│    to complete        │    of parent          │
└───────────────────────┴───────────────────────┘
```

## **Summary**

| Concept | Key Points |
|---------|------------|
| **Process States** | Running, Ready, Waiting; managed via queues |
| **Memory Space** | Each process has isolated virtual address space |
| **PCB** | Kernel data structure containing all process info |
| **fork()** | Creates child as exact duplicate; returns different values |
| **exec()** | Replaces current process with new program |
| **Common Pattern** | `fork()` then `exec()` for process creation |

This abstraction enables:
- **Multitasking**: Multiple processes running concurrently
- **Isolation**: Process failures don't crash system
- **Resource management**: Controlled access to hardware
- **Security**: Protection between processes