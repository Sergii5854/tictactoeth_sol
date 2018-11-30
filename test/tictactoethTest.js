const gameLib = artifacts.require("./gameLib.sol");
const tictactoeth = artifacts.require("./tictactoeth.sol");
var mothership;

contract('gameLib', (accounts)=>{

  it("should deploy tictactoeth contract",function(){
    var instance;
    return tictactoeth.deployed()
      .then((_instance)=>{
        instance = _instance;
        return instance.fees.call();
      }).then((fees)=>{
        assert.equal( fees.toNumber(), 0, "Fees not 0");
        return instance.numGames.call();
      }).then((numGames)=>{
        assert.equal( numGames.toNumber(), 0, "Number of games not 0");
        return instance.owner.call();
      }).then((owner)=>{
        assert.equal( owner, accounts[0], "Owner not initial account");
      });
  });

  it("should create a new game", function() {
    var instance;
    return tictactoeth.deployed()
      .then((_instance)=>{
        instance = _instance;
        return instance.newGame.sendTransaction(123,247365,7,{value:456});
      }).then((trx)=>{
        return instance.numGames.call();
      }).then((numGames)=>{
        assert.equal( numGames.toNumber(), 1, "Number of games not 1");
        return instance.games.call(0);
      }).then((game)=>{
          assert.equal(game[0],accounts[0],"playerX not account 0");
          assert.equal(game[2].toNumber(),456,"Bet not 456");
          assert.equal(game[3].toNumber(),123,"Wager not 123");
          assert.equal(game[4].toNumber(),247365,"Turn length not 247365");
          assert.equal(game[6].toNumber(),1,"Number of moves not 1");
          return instance.getMoves.call(0)
      }).then((moves)=>{
          assert.equal(moves[7].toNumber(),1,"Move not set")
      });
  });

  it("should join a second player", function() {
    var id, instance;
    return tictactoeth.deployed()
      .then((_instance)=>{
        instance = _instance;
        return instance.newGame.sendTransaction(123,247365,7,{from:accounts[1],value:456});
      }).then((trx)=>{
        return instance.numGames.call();
      }).then((numGames)=>{
        id = numGames - 1;
        return instance.joinGame.sendTransaction(id,6,{from:accounts[2],value:123});
      }).then((trx)=>{
        return instance.games.call(id);
      }).then((game)=>{
          assert.equal(game[0],accounts[1],"playerX not account 1");
          assert.equal(game[1],accounts[2],"playerO not account 2");
          assert.equal(game[2].toNumber(),456,"Bet not 456");
          assert.equal(game[3].toNumber(),123,"Wager not 123");
          assert.equal(game[4].toNumber(),247365,"Turn length not 247365");
          assert.equal(game[6].toNumber(),2,"Number of moves not 2");
          return instance.getMoves.call(id)
      }).then((moves)=>{
          assert.equal(moves[7].toNumber(),1,"playerX move not set")
          assert.equal(moves[6].toNumber(),2,"playerO move not set")
      });
  });

  it("should make a move", function() {
    var id, instance;
    return tictactoeth.deployed()
      .then((_instance)=>{
        instance = _instance;
        return instance.newGame.sendTransaction(123,247365,7,{from:accounts[1],value:456});
      }).then((trx)=>{
        return instance.numGames.call();
      }).then((numGames)=>{
        id = numGames - 1;
        return instance.joinGame.sendTransaction(id,6,{from:accounts[2],value:123});
      }).then((trx)=>{
        return instance.newMove.sendTransaction(id,5,{from:accounts[1]});
      }).then((trx)=>{
        return instance.games.call(id);
      }).then((game)=>{
          assert.equal(game[0],accounts[1],"playerX not account 1");
          assert.equal(game[1],accounts[2],"playerO not account 2");
          assert.equal(game[2].toNumber(),456,"Bet not 456");
          assert.equal(game[3].toNumber(),123,"Wager not 123");
          assert.equal(game[4].toNumber(),247365,"Turn length not 247365");
          assert.equal(game[6].toNumber(),3,"Number of moves not 3");
          return instance.getMoves.call(id)
      }).then((moves)=>{
          assert.equal(moves[7].toNumber(),1,"playerX move not set")
          assert.equal(moves[6].toNumber(),2,"playerO move not set")
          assert.equal(moves[5].toNumber(),1,"New move not set")
      });
  });
});