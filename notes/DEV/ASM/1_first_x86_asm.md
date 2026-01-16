# First x86 assembly

```s

section .data
	msg db "hello, world!"

section .text
global _start	

_start:
	mov	eax, 1
	mov	ebx, 1
	int	80h
```


- eax: syscall number -> 1: exit
- ebx: function argument
- int: interrupt
- 80h: syscall


# compile

1. run `nasm -f elf64 -o first.o first.asm` (assembler output object file)
2. run `ld -o first first.o`
3. ./first


# GDB
1. gdb first
2. layout asm
3. break _start
4. run
5. stepi x2
6. info register ebx -> output 1

