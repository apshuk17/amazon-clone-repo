module.exports = async ({getNamedAccounts, deployments}) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const amazonCoin = await deploy("AmazonCoin", {
      from: deployer,
      log: true,
      waitConfirmations: 3
  });

}