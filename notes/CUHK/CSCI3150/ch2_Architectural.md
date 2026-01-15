# **Operating System Events: A Comprehensive Overview**

## **Introduction to Events**

### **Event Flow in OS**
After the operating system boots, all kernel entries occur as a result of events. An event represents an "unnatural" change in control flow that:
- Immediately halts current execution
- Changes processor mode to kernel mode
- Invokes a predefined event handler

```
┌─────────────┐    Event    ┌─────────────┐
│   User      │─────────────▶   Kernel    │
│   Mode      │             │   Mode      │
│             │◀─────────────│             │
│  Process    │   Return    │  Handler    │
└─────────────┘             └─────────────┘
        │                         │
        └─────── Context Switch ──┘
        (User Mode → Kernel Mode)
```

### **Event Handling Mechanism**
The kernel defines a handler for each event type, and all event handlers execute in kernel mode. When the processor receives an event:

```
┌─────────────────────────────────────────────────────┐
│           Event Handling Sequence                   │
├─────────────────────────────────────────────────────┤
│ 1. Control transfers to OS handler                  │
│ 2. Handler saves current program state              │
│ 3. Invokes specific functionality (e.g., I/O)       │
│ 4. Restores saved state                             │
│ 5. Returns to interrupted execution                 │
└─────────────────────────────────────────────────────┘
```

## **Event Categories**

### **Classification Matrix**
```
┌─────────────────────────────────────────────────────────────┐
│                   Event Classification                       │
├─────────────────────────────┬───────────────────────────────┤
│                             │    Reason for Event           │
│    Event Type               ├──────────────┬────────────────┤
│                             │  Unexpected  │  Deliberate    │
├─────────────────────────────┼──────────────┼────────────────┤
│  Exception (Synchronous)    │              │                │
│  - Within current context   │    Fault     │ System Call    │
│                             │              │     Trap       │
├─────────────────────────────┼──────────────┼────────────────┤
│  Interrupt (Asynchronous)   │              │                │
│  - Outside current context  │  Hardware    │   Software     │
│                             │  Interrupt   │   Interrupt    │
└─────────────────────────────┴──────────────┴────────────────┘
```

### **Key Characteristics**
- **Exceptions**: Synchronous events caused by executing instructions
- **Interrupts**: Asynchronous events caused by external devices
- **Faults**: Unexpected exceptions (e.g., page faults, division by zero)
- **System Calls**: Deliberate exceptions for privileged operations

## **Faults: Detailed Analysis**

### **Fault Detection and Reporting**
Hardware detects and reports exceptional conditions:
- Page faults (accessing non-resident memory)
- Division by zero
- Unaligned memory access
- Invalid instruction execution
- Protection violations

```
┌─────────────────────────────────────────────────────┐
│               Fault Handling Flow                    │
├─────────────────────────────────────────────────────┤
│  User Process     │      Kernel                     │
├───────────────────┼─────────────────────────────────┤
│ Execute           │                                 │
│ Instruction       │                                 │
│    ↓              │                                 │
│ FAULT occurs      │                                 │
│    ↓              │                                 │
│                   │ Trap to Kernel Mode             │
│                   │    ↓                            │
│                   │ Save Process State              │
│                   │    ↓                            │
│                   │ Analyze Fault Type              │
│                   │    ↓                            │
│                   │ Can it be fixed?                │
│                   │    ├─── YES ──▶ Fix & Resume    │
│                   │    └─── NO ───▶ Kill Process    │
└───────────────────┴─────────────────────────────────┘
```

### **Fault as Performance Optimization**
Fault exceptions serve as performance optimization mechanisms. For example:
- **Page Faults**: Enable demand paging (load pages only when needed)
- **Copy-on-Write**: Defer memory copying until modification

### **Fault Handling Strategies**

#### **Recoverable Faults**
```c
// Example: Page Fault Handler Pseudocode
void handle_page_fault(fault_address, fault_type) {
    if (address_in_valid_range(fault_address)) {
        if (fault_type == PAGE_NOT_PRESENT) {
            load_page_from_disk(fault_address);
            resume_process();
        } else if (fault_type == PROTECTION_VIOLATION) {
            send_sigsegv_to_process();
        }
    } else {
        send_sigsegv_to_process();
    }
}
```

#### **Unrecoverable Faults**
- No registered handler exists
- Kernel halts the process
- Process state written to core dump file
- Process destroyed
- **Default action in Unix systems**

### **Kernel Faults**
```
┌─────────────────────────────────────────┐
│        Kernel Fault Scenarios           │
├─────────────────────────────────────────┤
│   Fault Type   │       Consequence      │
├────────────────┼────────────────────────┤
│ Recoverable    │ Continue Execution     │
│ Unrecoverable  │ OS Crash (Kernel Panic)│
│                │ • Kernel halted        │
│                │ • State dumped to file │
│                │ • System may reboot    │
└────────────────┴────────────────────────┘
```

## **System Calls: Interface to Kernel Services**

### **Purpose and Mechanism**
System calls allow user processes to perform privileged operations (e.g., I/O, memory allocation). Hardware provides system call instructions that:

```
┌─────────────────────────────────────────────────────┐
│          System Call Execution Flow                  │
├─────────────────────────────────────────────────────┤
│ 1. Process executes system call instruction         │
│ 2. Exception triggered, vectors to kernel handler   │
│ 3. Parameter identifies specific system routine     │
│ 4. Caller state saved for restoration              │
│ 5. Kernel performs requested operation              │
│ 6. Return from system call restores saved state     │
└─────────────────────────────────────────────────────┘
```

### **System Call Implementation Example**

#### **Assembly Level (Linux x86)**
```assembly
; System call: open(path, flags, mode)
section .text
global _start

_start:
    ; Linux system call convention
    mov eax, 5        ; syscall number for 'open'
    mov ebx, path     ; first argument: pathname
    mov ecx, flags    ; second argument: flags
    mov edx, mode     ; third argument: mode
    int 0x80          ; software interrupt to kernel
    
    ; Return value in eax
    cmp eax, 0
    jl error_handler

section .data
path db '/etc/passwd', 0
flags equ 0          ; O_RDONLY
mode equ 0           ; not used for O_RDONLY
```

#### **High-Level Abstraction**
```c
// Application code uses library wrappers
#include <stdio.h>
#include <fcntl.h>

int main() {
    int fd = open("/etc/passwd", O_RDONLY);
    if (fd < 0) {
        perror("open failed");
        return 1;
    }
    // Use file descriptor
    close(fd);
    return 0;
}
```

### **System Call Diagram**
```
┌─────────────────────────────────────────────────────┐
│      User-Kernel Transition via System Call         │
└─────────────────────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    │   User Mode   │   Kernel Mode │
    ├───────────────┼───────────────┤
    │               │               │
    │  Application  │               │
    │      ↓        │               │
    │  Library      │               │
    │  Wrapper      │               │
    │      ↓        │               │
    │  Trap to      │  System Call  │
    │  Kernel       │    Handler    │
    │      │        │       ↓       │
    │      │        │  Dispatch to  │
    │      │        │  Specific     │
    │      │        │  Routine      │
    │      │        │       ↓       │
    │      │        │  Execute      │
    │      │        │  Kernel       │
    │      │        │  Function     │
    │      │        │       ↓       │
    │      │        │  Return to    │
    │      ◀────────┼───────┘       │
    │  Resume       │               │
    │  Execution    │               │
    └───────────────┴───────────────┘
```

### **Why Use Library Wrappers Instead of Direct System Calls?**
1. **Portability**: Different kernels have different system call numbers and interfaces
2. **Abstraction**: Libraries provide consistent API across platforms
3. **Error Handling**: Libraries convert error codes to errno and provide perror()
4. **Performance**: Libraries may buffer or optimize operations

## **Interrupts: Asynchronous Event Handling**

### **Types of Interrupts**
1. **Hardware Interrupts**: Generated by I/O devices
2. **Timer Interrupts**: Generated by system timer
3. **Software Interrupts**: Generated by software (e.g., `int` instruction)

### **Interrupt Descriptor Table (IDT)**
The OS sets up the IDT during boot time to map interrupt numbers to handlers:

```
┌─────────────────────────────────────────────────────┐
│        Interrupt Handling via IDT                   │
├─────────────────────────────────────────────────────┤
│  Interrupt    │  IDT Lookup      │  Handler         │
│  Number       │  Process         │  Execution       │
├─────────────────────────────────────────────────────┤
│     32        │   handler =      │  timer_handler() │
│  (Timer)      │   IDT[32]        │                  │
├─────────────────────────────────────────────────────┤
│     33        │   handler =      │  keyboard_       │
│ (Keyboard)    │   IDT[33]        │  handler()       │
├─────────────────────────────────────────────────────┤
│     80h       │   handler =      │  syscall_        │
│  (System      │   IDT[0x80]      │  handler()       │
│   Call)       │                  │                  │
└─────────────────────────────────────────────────────┘
```

### **Timer Interrupts: Critical OS Mechanism**

#### **Importance of Timer Interrupts**
```
┌─────────────────────────────────────────────────────┐
│            Timer Interrupt Applications              │
├─────────────────────────────────────────────────────┤
│     Application        │         Purpose            │
├────────────────────────┼────────────────────────────┤
│ Prevent Infinite Loops │ Force context switches     │
│ Basis for Scheduler    │ Enable preemptive multitask│
│ Time-based Functions   │ Implement sleep(), alarm() │
│ Performance Monitoring │ Measure CPU usage          │
│ Real-time Operations   │ Meet timing deadlines      │
└─────────────────────────────────────────────────────┘
```

#### **Timer Implementation**
```c
// Simplified timer interrupt handler
void timer_interrupt_handler() {
    // Save current context
    save_context(current_process);
    
    // Update system time
    system_time++;
    
    // Decrement sleep counters
    update_sleeping_processes();
    
    // Check if time slice expired
    if (--current_process->time_quantum <= 0) {
        schedule_next_process();  // Context switch
    }
    
    // Send EOI to interrupt controller
    send_eoi();
    
    // Restore context (may be different process)
    restore_context(next_process);
}
```

### **Polling vs. Interrupt-Driven I/O**

#### **Polling Method**
```cpp
// CPU-intensive polling approach
while (ethernet_card_queue_is_empty()) {
    // Busy waiting - wastes CPU cycles
    // No useful work done while waiting
}
handle_packets();
```

#### **Interrupt-Driven Method**
```cpp
// Interrupt-driven approach
void network_interrupt_handler() {
    // Called only when packets arrive
    handle_packets();
    // CPU free to do other work between interrupts
}

// Main program continues execution
process_user_requests();
perform_calculations();
// ... other work
```

#### **Comparison Analysis**
```
┌─────────────────────────────────────────────────────┐
│     Polling vs. Interrupt-Driven I/O Comparison     │
├─────────────────────────┬───────────────────────────┤
│         Aspect          │       Polling     │ Intr │
├─────────────────────────┼───────────────────────────┤
│ CPU Utilization         │     High (Waste)  │  Low │
│ Response Latency        │     Predictable   │  Var │
│ Implementation          │     Simple        │Complex│
│ Best For                │ High-frequency I/O│Low-frq│
│ Context Switches        │     None          │  Yes │
│ Power Efficiency        │     Poor          │ Good │
└─────────────────────────┴───────────────────────────┘
```

### **Interrupt Handling Optimization**
Modern systems often use hybrid approaches:
- **NAPI (New API) in Linux**: Combines interrupts and polling for network
- **Interrupt Coalescing**: Batch multiple interrupts to reduce overhead
- **MSI/MSI-X**: Message Signaled Interrupts for better scalability

## **Event Priority and Nesting**

### **Interrupt Priority Levels**
```
┌─────────────────────────────────────────┐
│    Typical Interrupt Priority Hierarchy  │
├─────────────────────────────────────────┤
│          Priority         │   Source    │
├───────────────────────────┼─────────────┤
│ Highest (Non-maskable)    │ Hardware    │
│                           │  Failure    │
├───────────────────────────┼─────────────┤
│ High                      │ Timer       │
├───────────────────────────┼─────────────┤
│ Medium                    │ Disk I/O    │
├───────────────────────────┼─────────────┤
│ Low                       │ Network     │
├───────────────────────────┼─────────────┤
│ Lowest                    │ Serial Port │
└───────────────────────────┴─────────────┘
```

### **Nested Interrupt Handling**
```c
// Example of nested interrupt handling
void high_priority_interrupt() {
    disable_lower_priority_interrupts();
    // Handle high-priority event
    enable_lower_priority_interrupts();
}

void low_priority_interrupt() {
    // May be interrupted by higher priority interrupts
    // Critical sections protected by interrupt disabling
}
```

## **Summary: Event Processing in Modern OS**

### **Complete Event Handling Pipeline**
```
┌─────────────────────────────────────────────────────┐
│           Comprehensive Event Processing             │
├─────────────────────────────────────────────────────┤
│   Event Source   →   Detection   →   Classification │
│         ↓                  ↓               ↓        │
│   Save Context   →   IDT Lookup   →   Handler Exec │
│         ↓                  ↓               ↓        │
│   Kernel Action  →  State Update  →  Context Restore│
│         ↓                  ↓               ↓        │
│   Return to      ←    Cleanup     ←   Send EOI      │
│   Execution                                         │
└─────────────────────────────────────────────────────┘
```

### **Key Takeaways**
1. **Events** are fundamental to OS operation, enabling user-kernel transitions
2. **Exceptions** are synchronous (caused by execution), while **interrupts** are asynchronous
3. **Faults** can be recoverable (page faults) or unrecoverable (segmentation faults)
4. **System calls** provide controlled access to kernel services
5. **Timer interrupts** enable preemptive multitasking and time management
6. Modern systems optimize event handling through techniques like interrupt coalescing and hybrid polling/interrupt models

### **Performance Considerations**
- **Context switch overhead**: Typically 1-100 microseconds
- **Interrupt latency**: Time from interrupt to handler start
- **Throughput vs. Latency trade-offs**: Polling vs. interrupt-driven I/O
- **Scalability**: Handling increasing numbers of devices and cores

This comprehensive understanding of OS events forms the foundation for studying advanced topics like scheduling, memory management, and I/O subsystems.