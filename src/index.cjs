const { input, select, password } = require("@inquirer/prompts");
const { config } = require("./config");
const {
  getNTFSList,
  askForNeedMount,
  askForNeedUnMount,
  execMount,
  execUnMount,
  initConfiguration,
  testPassword,
  encrypt_aes_128_cbc,
  simpleKV,
} = require("./api");
const ntfsList = getNTFSList();
process.on("uncaughtException", error => {
  process.exit(1); // process exit 1
});
try {
  (async function main() {
    const args = process.argv.slice(2);

    if (/-init|init/.test(args[0])) {
      //todo init
      const passwd = await password({ message: "Enter the sudo user password:" });

      if (testPassword(passwd)) {
        const kv = simpleKV(passwd);

        config.password = encrypt_aes_128_cbc(passwd, kv, kv);
        config.kv = kv.toString("hex");
        const ok = initConfiguration(config);
        if (ok) {
          console.log("init success");
        } else {
          console.log("init error");
        }
      } else {
        console.log("init error");
      }

      return;
    } else if (/-h|--help|help/.test(args[0])) {
      console.log(config.help);
      return;
    } else if (/-V|--version/.test(args[0])) {
      console.log(config.version);
      return;
    }

    if (ntfsList.length <= 0) {
    }
    const selectRes = await select({
      message: "请选择要挂载的磁盘: ",
      choices: ntfsList.map(item => ({
        value: item.index,
        name: `NTFS-${item.index} ${item.name} ${item.size} ${item.identifier}${item.mounted ? "" : ":mounted"}`,
        default: item.index == 0,
      })),
    });
    const selNTFS = ntfsList[selectRes];
    if (askForNeedMount(selNTFS)) {
      // console.log("need mount");
      if (askForNeedUnMount(selNTFS)) {
        // console.log("need un mount");
        if (execUnMount(selNTFS)) {
          console.log("unmount success!");
        } else {
          console.log("unmount fail!");
        }
      }

      if (execMount(selNTFS)) {
        console.log("\nmount success!");
      } else {
        console.log("\nmount fail!");
      }
    } else {
      console.log("no need to mount!");
    }
  })();
} catch (err) {
  console.log(err);
}
