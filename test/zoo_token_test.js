const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Zoo Token Test", function () {
  let zooToken = null;
  let ownerAccount = null;
  let tester1Account = null;
  let tester2Account = null;
  let totalSupply = ethers.utils.parseUnits("1000000");

  before(async () => {
    const ZooToken = await ethers.getContractFactory("ZooToken");
    zooToken = await ZooToken.deploy(totalSupply);
    await zooToken.deployed();

    [ownerAccount, tester1Account, tester2Account] = await ethers.getSigners();
    console.log("Owner address: " + ownerAccount.address);
    console.log("Tester1 address: " + tester1Account.address);
    console.log("Tester2 address: " + tester2Account.address);
  });

  it("Owner's initial balance test", async function () {
    const ownerBalance = await zooToken.balanceOf(ownerAccount.address);
    console.log("Owner's balance", ethers.utils.formatEther(ownerBalance));
    expect(ownerBalance).to.equal(totalSupply);
  });

  it("Token transfer test", async function () {
    const transferAmount = ethers.utils.parseEther("10");

    let tx = await zooToken.transfer(tester1Account.address, transferAmount);
    await tx.wait();

    const ownerBalance = await zooToken.balanceOf(ownerAccount.address);
    console.log("Owner's balance", ethers.utils.formatEther(ownerBalance));

    const tester1Balance = await zooToken.balanceOf(tester1Account.address);
    console.log("Tester1's balance", ethers.utils.formatEther(tester1Balance));

    expect(ownerBalance).to.equal(totalSupply.sub(transferAmount));
    expect(tester1Balance).to.equal(transferAmount);
  });

  it("Token allow test", async function () {
    const transferAmount = ethers.utils.parseEther("10");

    let tx = await zooToken.approve(tester1Account.address, transferAmount);
    await tx.wait();

    const tester1Allowance = await zooToken.allowance(
      ownerAccount.address,
      tester1Account.address
    );
    console.log(
      "Owner's allowance about Tester1",
      ethers.utils.formatEther(tester1Allowance)
    );

    expect(tester1Allowance).to.equal(transferAmount);

    const ownerBalanceBeforeTransfer = await zooToken.balanceOf(
      ownerAccount.address
    );
    console.log(
      "Owner's balance before transferFrom call.",
      ethers.utils.formatEther(ownerBalanceBeforeTransfer)
    );

    let tester1Balance = await zooToken.balanceOf(tester1Account.address);
    console.log(
      "Tester1's balance before transferFrom call.",
      ethers.utils.formatEther(tester1Balance)
    );

    tx = await zooToken
      .connect(tester1Account)
      .transferFrom(
        ownerAccount.address,
        tester2Account.address,
        transferAmount
      );
    await tx.wait();

    const ownerBalance = await zooToken.balanceOf(ownerAccount.address);
    console.log("Owner's balance", ethers.utils.formatEther(ownerBalance));

    tester1Balance = await zooToken.balanceOf(tester1Account.address);
    console.log("Tester1's balance", ethers.utils.formatEther(tester1Balance));

    const tester2Balance = await zooToken.balanceOf(tester2Account.address);
    console.log("Tester2's balance", ethers.utils.formatEther(tester2Balance));

    expect(ownerBalance).to.equal(
      ownerBalanceBeforeTransfer.sub(transferAmount)
    );
    expect(tester2Balance).to.equal(transferAmount);
  });
});
