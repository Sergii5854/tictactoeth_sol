const gameLib = artifacts.require("./gameLib.sol");
const tictactoeth = artifacts.require("./tictactoeth.sol");
var mothership;

contract('gameLib', (accounts)=>{

  it("should deploy tictactoeth contract",function(){
    var instance;
    return tictactoeth.deployed()
      .then((_instance)=>{
        instance = _instance;
        return instance.fees.call()
      }).then((fees)=>{
        assert.equal( fees.toNumber(), 0, "Fees not 0");
        return instance.numGames.call()
      }).then((numGames)=>{
        assert.equal( numGames.toNumber(), 0, "Number of games not 0");
        return instance.owner.call()
      }).then((owner)=>{
        assert.equal( owner, accounts[0], "Owner not initial account");
      });
  });

/*
  it("should create a new game", function() { // Upgrade to await?
    return mothership.newGame( 200,300000000, 1, {from: accounts[1]} ).then((trx)=>{
      return mothership.numGames.call().then((number)=>{
        assert.equal(number.toNumber(),1,"Number of games not 1.");
        return mothership.games.call(0).then((game)=>{
          assert.equal(game[0],accounts[1],"Account 1 is not playerX.");
          assert.equal(game[6].toNumber(),1,"Move number is not 1.");
        });
      });
    });
  });

  it("should join a second player",function(){
    return mothership.joinGame.sendTransaction(0,3,{from:accounts[2],value:200}).then((trx)=>{
      return mothership.games.call(0).then((game)=>{
        assert.equal(game[6].toNumber(),2,"Move number is not 2.");
        assert.equal(game[1],accounts[2],"Account 2 is not playerO.");
      });
    });
  });

  it("should make a move",function(){
    return mothership.newMove.sendTransaction(0,5,{from:accounts[1]}).then((trx)=>{
      return mothership.games.call(0).then((game)=>{
        assert.equal(game[6].toNumber(),3,"Move number is not 3.");
        return mothership.getMoves.call(0).then((moves)=>{
          assert.equal(moves[1],1,"First move incorrect.");
          assert.equal(moves[3],2,"Second move incorrect.");
          assert.equal(moves[5],1,"Third move incorrect.");
        });
      });
    });
  });
*/

});