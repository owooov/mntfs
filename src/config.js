const config = {
  name: "mntfs tool config",
  version: "0.1.1",
  description: "Mntfs is a command-line tool based on macFUSE driver for mounting ntfs disks",
  password: "",
  help: `mntfs - Mntfs is a command-line tool based on macFUSE driver for mounting ntfs disks

  usage: mntfs --init | --help | -V


  Options:
    init, --init                  Initialize and remember the administrator password for next use
    -h, --help                    display help message and exit
    -V, --version                 display version information and exit`,
};
exports.config = config;
