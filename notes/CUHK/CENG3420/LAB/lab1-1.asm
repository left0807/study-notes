.global _start

.data
msg: asciz "Hello, world!\n"

.section .text
_start:
	li a0, 2 	;li - load immediate, a0 - argument
	li a7, 93	; a7 - systemcall resgister, 93 - exit
	ecall		; interrupt
