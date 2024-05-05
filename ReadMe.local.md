Mntfs

Mntfs is a command-line tool based on macFUSE driver for mounting ntfs disks

# 解析终端输出

```
/dev/disk0 (internal, physical):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      GUID_partition_scheme                        *500.3 GB   disk0
   1:                        EFI EFI                     314.6 MB   disk0s1
   2:                 Apple_APFS Container disk1         433.0 GB   disk0s2
   3:       Microsoft Basic Data BOOTCAMP                67.0 GB    disk0s3

/dev/disk1 (synthesized):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      APFS Container Scheme -                      +433.0 GB   disk1
                                 Physical Store disk0s2
   1:                APFS Volume Macintosh_HD            1.0 MB     disk1s1
   2:                APFS Volume Preboot                 2.1 GB     disk1s3
   3:                APFS Volume Recovery                1.2 GB     disk1s4
   4:                APFS Volume VM                      2.1 GB     disk1s5
   5:                APFS Volume Sonoma - Data           111.5 GB   disk1s7
   6:                APFS Volume Sonoma                  10.2 GB    disk1s8
   7:              APFS Snapshot com.apple.os.update-... 10.2 GB    disk1s8s1
   8:                APFS Volume MacOS                   183.1 GB   disk1s9

/dev/disk2 (external, physical):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      GUID_partition_scheme                        *1.0 TB     disk2
   1:       Microsoft Basic Data Windows                 343.6 GB   disk2s1
   2:                  Apple_HFS APPLE                   322.0 GB   disk2s2
   3:           Linux Filesystem                         334.2 GB   disk2s3

/dev/disk3 (disk image):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      GUID_partition_scheme                        +17.3 GB    disk3
   1:                 Apple_APFS Container disk4         17.3 GB    disk3s1

/dev/disk4 (synthesized):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      APFS Container Scheme -                      +17.3 GB    disk4
                                 Physical Store disk3s1
   1:                APFS Volume iOS 17.4 21E213 Simu... 16.8 GB    disk4s1
```

## 关键命令

```bash
# /dev/disk2s1 来自上面的挂载点
sudo diskutil unmount /dev/disk2s1
Volume Windows on disk2s1 unmounted （卸载分区成功输出）
# 新建目录确定挂载后的根目录
sudo mkdir /Volumes/Windows (可不做)
# 执行挂载
sudo /usr/local/bin/ntfs-3g /dev/disk4s1 /Volumes/Windows -o local -o allow_other -o auto_xattr -o auto_cache

echo <passwd> | sudo -S <command>
```

## 帮助

```txt
mntfs - Mntfs is a command-line tool based on macFUSE driver for mounting ntfs disks

usage: mntfs --init | --help | -V


Options:
  init, --init                  Initialize and remember the administrator password for next use
  -h, --help                    display help message and exit
  -V, --version                 display version information and exit
```

## 挂载流程

0. 初始化

   1. mntfs init
   2. 提示输入密码并记录

1. 判断是否需要挂载

   1. 可以读写 无需挂载
   2. 可以读不可写
      1. 需要先重启 finder
      2. 需要卸载后进行重新挂载
   3. 不可读写
      1. 可以直接挂载

2. 判断是否挂载成功
3. 优化

   1. 显示挂载状态

## 捕获全局错误
