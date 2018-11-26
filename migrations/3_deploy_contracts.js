var gameLib = artifacts.require("./gameLib.sol");
var tictactoeth = artifacts.require("./tictactoeth.sol");

module.exports = function(deployer) {
  deployer.link(gameLib, tictactoeth);
  return deployer.deploy( tictactoeth );
};