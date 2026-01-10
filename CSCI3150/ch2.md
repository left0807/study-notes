

## Memory Protection

### Events


#### Flow

- After the OS has booted, all entry to the kernel happens ad the result of an event
    - event immediately stops current execution
    - change mode to kernel mode, event handler is called

- An event is an "unnatural: change in control flow
    - Event immediately stop current execution
    - Changes mode, context, or both (single core)

----------
|  user  ||  kernel  | 
----------
        ^
        |
        context switch
        user mode -> kernel mode

- kernel defines a handler for each eent ype
    - Event handler always execute in kernal mode
    - The specific types of eents are defined by the machine

- When the processor receives an event of a given type
    1. transfer control to handler within the OS
    2. handler save program state
    3. funtionality invoke (e.g. IO)
    4. restore state


#### Category

interrupts
: caused by an external event (e.g. I/O Ctrl+C)

exceptions
: caused by executing instrucitons

two reason for events: ** unexpected and delibreate **

|                                      | Unexpected | Delibrate          |
| Exception(sync) -> within context    | fault      | syscall trap       |
| Interrupts(async) -> outside context | interrupt  | software interrupt |


#### Faults
- Hardware detects and reports "exceptional" conditions
    -  Page fault, devide by zero, unaligned acess
- Upon exception, hardware "faults" (verb)
        
- Fault exception == performace optimization
    
- Handling Fault: fixing it / notifying the process

- kernal may handle unrecoverable faults by killing the user
    - no registered handler
    - halt process, write process stae to file, destroy process
    - default action in Unix
    
- faults in kernal ?
    - fatal -> os crash -> hernal is halted, state dumped to core file


#### System Call
For a user to do some "privileged" action (e.g. I/O)

- Hardware procides a system call instruction that
    1. Cased an exeption, which vectors to a kernel handler
    2. Passes a parameter determining the sysem routine to call 
    3. Saves caller State so it can be restore
    4. Returning from system call restores this state

- System call function: a lot 
    - Programmers generally do not use system calls
    - Instead -> stdio.h
    - ** Reason **: Because different kernel have different set of syscall
    
e.g.
```asm
open (path, flags, mode);

open: ;Linux convention:
    
    mov eax, 5 ; syscall number
    mov ebx, path ; ebx: first number
    ...
    int 80h

; int 80h -> interrupt vector into kernal (80h)
; read %eax, 5 is syscall number for open
```


