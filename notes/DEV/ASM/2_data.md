# Data and Stack Memory

## .data
`section .data`

### btye
`DB` - define byte (1 byte)
`DW` - define word (2 byte)
`DD` - define double word (4 byte)
`DQ`
`DT`


```s
section .data
	num DD 5

...
    mov ebx, num        ;store address of num in ebx

    mov ebx, [num]      ;store value of num in ebx 
```


gdb: `x/x $ebx`: show value store in the address: $ebx
$ -> output value of ebx



```s
    num DB 1
    num2 DB 2

    mov ebx, [num]
    mov ecx, [num2] 
```

when you run:
gdb:
`info register ebx`, it will show 512
if we look into address of num: `x/x 0x402000`, output:  0x00000201
because in ebx is a 32 bits register + bytes are assigned with adjcent address
i.e.
num is 8 bits (1 byte) has address `0x402000`
num2 is 8 bits (1 byte) has address `0x402001`

therefore, when a word (4 byte == 32 bits) is assign to eax, i.e. from `0x402000` to `0x402003`
it will have value 0x0000 02 (belongs to num2) 01 (belongs to num)


## How to fix

```
ues bl/cl -> lower 8 bits
use bh/ch -> higher 8 bits
```

# Takeaway

working at 
32bits: use `eax ebx`
16bitx: use `ax, bx`
8bits: use `al/ah, bl/bh`


## Visualizing the register

```
<--al--><--ah-->
<------ax------>
<---------------eax------------------->
<--------------------------------------rbx------------------------->
0th bit --------------------------------------------------------- 64th bit
```


# Uninitialize data

```
section .bss
    num RESB 3
```
RESB stands for reserve bytes, here i reserve 3 bytes

noted that you can't do
```
    mov [num], 1
```
because assembly don't know the size of the data assign or to-be-assign
A **unit** is require


```
    mv bl, 1
    mv [num], bl
    mv [num+1], bl 
    mv [num+2], bl
```





