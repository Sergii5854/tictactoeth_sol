var gameLib = artifacts.require("./gameLib.sol");

module.exports = function(deployer) {
  return deployer.deploy(gameLib);
};