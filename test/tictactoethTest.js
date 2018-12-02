const gameLib = artifacts.require("./gameLib.sol");
const tictactoeth = artifacts.require("./tictactoeth.sol");
const cf = {
  "bet":700,
  "wager":500,
  "turn": 10000
}

function newGame(instance, playerX, move){
  var id,
      origBalance = web3.eth.getBalance(instance.address).toNumber();
  return instance.newGame.sendTransaction(cf.wager,cf.turn,move,{from:playerX,value:cf.bet})
    .then((trx)=>{
      assert.equal(web3.eth.getBalance(instance.address).toNumber(),cf.bet + origBalance,"Contract balance incorrect")
      return instance.numGames.call();
    }).then((numGames)=>{
      id = numGames.toNumber() - 1;
      return id;
    }).then((id)=>{
      return instance.games.call(id);
    }).then((game)=>{
      assert.equal(game[0],playerX,"playerX account incorrect");
      assert.equal(game[2].toNumber(),cf.bet,"Bet not cf.bet");
      assert.equal(game[3].toNumber(),cf.wager,"Wager not cf.wager");
      assert.equal(game[4].toNumber(),cf.turn,"Turn length not cf.turn");
      assert.equal(game[5].toNumber(),0,"Deadline not 0");
      assert.equal(game[6].toNumber(),1,"Number of moves not 1");
      return instance.getMoves.call(id)
    }).then((moves)=>{
        assert.equal(moves[move].toNumber(),1,"Move not set")
        return id;
    });
}

function joinGame(instance, playerO, move, id){
  var id,
      origBalance = web3.eth.getBalance(instance.address).toNumber();
  return instance.joinGame.sendTransaction(id,move,{from:playerO,value:cf.wager})
    .then((trx)=>{
      assert.equal(web3.eth.getBalance(instance.address).toNumber(),cf.wager+origBalance,"Contract balance incorrect")
      return instance.numGames.call();
    }).then((numGames)=>{
      id = numGames.toNumber() - 1;
      return instance.games.call(id);
    }).then((game)=>{
      assert.equal(game[1],playerO,"playerO account incorrect");
    });
}

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
    var id, instance, origBalance;
    return tictactoeth.deployed()
      .then((_instance)=>{
        instance = _instance;
        origBalance = web3.eth.getBalance(instance.address).toNumber();
        return newGame(instance,accounts[0],7)
      }).then((_id)=>{
        id = _id;
        return instance.cancelGame.sendTransaction(id);
      }).then((trx)=>{
        assert.equal(web3.eth.getBalance(instance.address).toNumber(),origBalance,"Contract balance incorrect")
        return instance.games.call(id);
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
        return newGame(instance, accounts[1], 0);
      }).then((_id)=>{
        id = _id;
        return joinGame(instance, accounts[2],8,id); 
      }).then((trx)=>{
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
        return newGame(instance, accounts[1], 0);
      }).then((_id)=>{
        id = _id;
        return joinGame(instance, accounts[2],8,id); 
      }).then((trx)=>{
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