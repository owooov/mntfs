const { execFileSync: exec, execSync } = require("child_process");
const fs = require("node:fs");
const path = require("path");

exports.getNTFSList = (filterString = "Microsoft Basic Data") => {
  return this.diskInfo2Object(filterString);
};

exports.askForCanRead = path => {
  try {
    fs.accessSync(path, fs.constants.R_OK);
    return true;
  } catch (err) {
    return false;
  }
};

exports.askForCanWrite = path => {
  try {
    fs.accessSync(path, fs.constants.W_OK);
    return true;
  } catch (err) {
    return false;
  }
};

const DEV_PREFIX = "/dev/";
const VOLUME_PREFIX = "/Volumes/";
exports.askForNeedUnMount = ntfs => {
  const path = VOLUME_PREFIX + ntfs.name;
  if (this.askForCanRead(path)) {
    return true;
  }
};

exports.askForNeedMount = ntfs => {
  const path = VOLUME_PREFIX + ntfs.name;
  if (this.askForCanRead(path) && !this.askForCanWrite(path)) {
    return true;
  } else if (!this.askForCanRead(path)) {
    return true;
  } else {
    return false;
  }
};

exports.execMount = ntfs => {
  try {
    const device = DEV_PREFIX + ntfs.identifier;
    const path = VOLUME_PREFIX + ntfs.name;
    let cmdPrefix = `/usr/bin/sudo`;
    if (this.isInited()) {
      const password = this.readConfigration().password;
      if (password) {
        cmdPrefix = `echo ${password} | /usr/bin/sudo -S`;
      }
    }
    cmd = `${cmdPrefix} /usr/local/bin/ntfs-3g ${device} ${path} -o local -o allow_other -o auto_xattr -o auto_cache`;
    const output = execSync(cmd);
    if (this.askForCanWrite(path)) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error("mount err", err);
    return false;
  }
};

exports.execUnMount = ntfs => {
  try {
    const device = DEV_PREFIX + ntfs.identifier;
    const cmd = `diskutil unmount ${device}`.split(" ");
    this.execRestartFinder();
    const output = exec("/usr/bin/sudo", cmd);
    return true;
  } catch (err) {
    console.error("un mount err: ", err);
    return false;
  }
};

exports.execRestartFinder = () => {
  try {
    const cmd = `killall Finder`.split(" ");
    const output = exec("/usr/bin/sudo", cmd);
    return true;
  } catch (err) {
    console.error("killall finder err:", err);
  }
};

const NO = "#:";
const TYPE = "TYPE";
const SIZE = "SIZE";
const NAME = "NAME";
const IDENTIFIER = "IDENTIFIER";

exports.diskInfo2Object = filterString => {
  const ntfsStd = exec("/usr/sbin/diskutil", ["list"]);
  const lineList = ntfsStd.toString().split("\n");
  const titleLine = lineList.find(item => /(#:\s+TYPE\s+NAME\s+SIZE\s+IDENTIFIER)/.test(item));

  const itemIndicator = { no: {}, type: {}, name: {}, size: {}, identifier: {} };
  itemIndicator.no = { startIndex: 0, endIndex: titleLine.indexOf(NO) + NO.length };
  itemIndicator.type = { startIndex: itemIndicator.no.endIndex, endIndex: titleLine.indexOf(TYPE) + TYPE.length + 1 };
  itemIndicator.name = { startIndex: itemIndicator.type.endIndex, endIndex: titleLine.indexOf(SIZE) - 1 };
  itemIndicator.size = { startIndex: itemIndicator.name.endIndex, endIndex: titleLine.indexOf(IDENTIFIER) };
  itemIndicator.identifier = { startIndex: itemIndicator.size.endIndex };

  const data = lineList
    .filter(item => /\s+\d:/.test(item))
    .filter(item => item.indexOf(filterString) != -1)
    .map((item, index) => {
      const number = item.substring(itemIndicator.no.startIndex, itemIndicator.no.endIndex).trim();
      const type = item.substring(itemIndicator.type.startIndex, itemIndicator.type.endIndex).trim();
      const name = item.substring(itemIndicator.name.startIndex, itemIndicator.name.endIndex).trim();
      const size = item.substring(itemIndicator.size.startIndex, itemIndicator.size.endIndex).trim();
      const identifier = item.substring(itemIndicator.identifier.startIndex).trim();
      const mounted = this.askForNeedMount({ index, type, name, size, identifier });
      return { index, type, name, size, identifier, mounted };
    });
  return data;
};

exports.initConfiguration = config => {
  try {
    const configDir = path.join(process.env.HOME, ".m-ntfs");
    const exists = fs.existsSync(configDir);
    if (!exists) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    const configFile = path.join(configDir, "init.json");
    const jsonContent = JSON.stringify(config, null, 4);
    fs.writeFileSync(configFile, jsonContent);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

exports.readConfigration = () => {
  try {
    const configFile = path.join(process.env.HOME, ".m-ntfs", "init.json");
    const data = fs.readFileSync(configFile, { encoding: "utf-8" });
    if (data) {
      const config = JSON.parse(data);
      return config;
    } else {
      return {};
    }
  } catch (error) {
    console.error(error);
    return {};
  }
};

exports.isInited = () => {
  return fs.existsSync(path.join(process.env.HOME, ".m-ntfs", "init.json"));
};

exports.testPassword = passwd => {
  try {
    const cmd = `echo ${passwd} | sudo -S echo testPasswd`;
    const stdout = execSync(cmd);
    return true;
  } catch (error) {
    return false;
  }
};
