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

  it("should create and cancel a game", function() { // Code 0
    var instance, origBalance;
    return tictactoeth.deployed()
      .then((_instance)=>{
        instance = _instance;
        origBalance = web3.eth.getBalance(instance.address).toNumber();
        return instance.newGame.sendTransaction(123,247365,7,{value:456});
      }).then((trx)=>{
        assert.equal(web3.eth.getBalance(instance.address).toNumber(),456 + origBalance,"Contract balance incorrect")
        return instance.numGames.call();
      }).then((numGames)=>{
        assert.equal( numGames.toNumber(), 1, "Number of games not 1");
        return instance.games.call(0);
      }).then((game)=>{
          assert.equal(game[0],accounts[0],"playerX not account 0");
          assert.equal(game[2].toNumber(),456,"Bet not 456");
          assert.equal(game[3].toNumber(),123,"Wager not 123");
          assert.equal(game[4].toNumber(),247365,"Turn length not 247365");
          assert.equal(game[5].toNumber(),0,"Deadline not 0");
          assert.equal(game[6].toNumber(),1,"Number of moves not 1");
          return instance.getMoves.call(0)
      }).then((moves)=>{
          assert.equal(moves[7].toNumber(),1,"Move not set")
          return instance.cancelGame.sendTransaction(0);
      }).then((trx)=>{
          assert.equal(web3.eth.getBalance(instance.address).toNumber(),origBalance,"Contract balance incorrect")
          return instance.games.call(0);
      }).then((game)=>{
          assert.equal(game[4].toNumber(),0,"Turn not 0");
          assert.equal(game[5].toNumber(),0,"Code not 0");
      });
  });

  it("should play to a win", function() { // Code 1
    var id, instance, origBalance;
    return tictactoeth.deployed()
      .then((_instance)=>{
        instance = _instance;
        origBalance = web3.eth.getBalance(instance.address).toNumber();
        return instance.newGame.sendTransaction(123,247365,0,{from:accounts[1],value:456});
      }).then((trx)=>{
        assert.equal(web3.eth.getBalance(instance.address).toNumber(),456+origBalance,"Contract balance incorrect")
        return instance.numGames.call();
      }).then((numGames)=>{
        id = numGames - 1;
        return instance.joinGame.sendTransaction(id,8,{from:accounts[2],value:123});
      }).then((trx)=>{
        assert.equal(web3.eth.getBalance(instance.address).toNumber(),123+456+origBalance,"Contract balance incorrect")
        return instance.games.call(id);
      }).then((game)=>{
        assert.equal(game[0],accounts[1],"playerX not account 1");
        assert.equal(game[1],accounts[2],"playerO not account 2");
        assert.equal(game[2].toNumber(),456,"Bet not 456");
        assert.equal(game[3].toNumber(),123,"Wager not 123");
        assert.equal(game[4].toNumber(),247365,"Turn length not 247365");
        assert.equal(game[6].toNumber(),2,"Number of moves not 2");
        return instance.newMove.sendTransaction(id,1,{from:accounts[1]});
      }).then((trx)=>{
        return instance.newMove.sendTransaction(id,7,{from:accounts[2]});
      }).then((trx)=>{
        return instance.newMove.sendTransaction(id,2,{from:accounts[1]});
      }).then((trx)=>{   
        assert.equal(web3.eth.getBalance(instance.address).toNumber(),origBalance,"Contract balance incorrect")
        return instance.getMoves.call(id)
      }).then((moves)=>{
        assert.equal(moves[0].toNumber(),1,"Move 1 not set")
        assert.equal(moves[8].toNumber(),2,"Move 2 not set")
        assert.equal(moves[1].toNumber(),1,"Move 3 not set")
        assert.equal(moves[7].toNumber(),2,"Move 4 not set")
        assert.equal(moves[2].toNumber(),1,"Move 5 not set")
        return instance.games.call(id);
      }).then((game)=>{
        assert.equal(game[4].toNumber(),0,"Turn not 0");
        assert.equal(game[5].toNumber(),1,"Code not 1");
      });
  });

  it("should play to a stalemate", function() { // Code 1
    var id, instance, origBalance;
    return tictactoeth.deployed()
      .then((_instance)=>{
        instance = _instance;
        origBalance = web3.eth.getBalance(instance.address).toNumber();
        return instance.newGame.sendTransaction(123,247365,0,{from:accounts[1],value:456});
      }).then((trx)=>{
        assert.equal(web3.eth.getBalance(instance.address).toNumber(),456+origBalance,"Contract balance incorrect")
        return instance.numGames.call();
      }).then((numGames)=>{
        id = numGames - 1;
        return instance.joinGame.sendTransaction(id,8,{from:accounts[2],value:123});
      }).then((trx)=>{
        assert.equal(web3.eth.getBalance(instance.address).toNumber(),123+456+origBalance,"Contract balance incorrect")
        return instance.games.call(id);
      }).then((game)=>{
        assert.equal(game[0],accounts[1],"playerX not account 1");
        assert.equal(game[1],accounts[2],"playerO not account 2");
        assert.equal(game[2].toNumber(),456,"Bet not 456");
        assert.equal(game[3].toNumber(),123,"Wager not 123");
        assert.equal(game[4].toNumber(),247365,"Turn length not 247365");
        assert.equal(game[6].toNumber(),2,"Number of moves not 2");
        return instance.newMove.sendTransaction(id,1,{from:accounts[1]});
      }).then((trx)=>{
        return instance.newMove.sendTransaction(id,7,{from:accounts[2]});
      }).then((trx)=>{
        return instance.newMove.sendTransaction(id,6,{from:accounts[1]});
      }).then((trx)=>{   
        return instance.newMove.sendTransaction(id,2,{from:accounts[2]});
      }).then((trx)=>{
        return instance.newMove.sendTransaction(id,5,{from:accounts[1]});
      }).then((trx)=>{   
        return instance.newMove.sendTransaction(id,3,{from:accounts[2]});
      }).then((trx)=>{
        return instance.newMove.sendTransaction(id,4,{from:accounts[1]});
      }).then((trx)=>{   
        //assert.equal(web3.eth.getBalance(instance.address).toNumber(),origBalance,"Contract balance incorrect")
        return instance.getMoves.call(id)
      }).then((moves)=>{
        assert.equal(moves[0].toNumber(),1,"Move 1 not set")
        assert.equal(moves[8].toNumber(),2,"Move 2 not set")
        assert.equal(moves[1].toNumber(),1,"Move 3 not set")
        assert.equal(moves[7].toNumber(),2,"Move 4 not set")
        assert.equal(moves[6].toNumber(),1,"Move 5 not set")
        assert.equal(moves[2].toNumber(),2,"Move 6 not set")
        assert.equal(moves[5].toNumber(),1,"Move 7 not set")
        assert.equal(moves[3].toNumber(),2,"Move 8 not set")
        assert.equal(moves[4].toNumber(),1,"Move 9 not set")
        return instance.games.call(id);
      }).then((game)=>{
        assert.equal(game[4].toNumber(),0,"Turn not 0");
        assert.equal(game[5].toNumber(),2,"Code not 2");
      });
  });

  it("should timeout", function() { // Code 3
  });
});