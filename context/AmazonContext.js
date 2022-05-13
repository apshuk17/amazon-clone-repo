import { createContext, useState, useEffect, useCallback } from "react";
import { useMoralis, useMoralisQuery } from "react-moralis";
import { amazonAbi, amazonCoinAddress } from "../lib/constants";
import { ethers } from "ethers";

export const AmazonContext = createContext();

const AmazonProvider = ({ children }) => {
  const [username, setUserName] = useState("");
  const [nickname, setNickName] = useState("");
  const [assets, setAssets] = useState([]);
  const [currentAccount, setCurrentAccount] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [amountDue, setAmountDue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [etherscanLink, setEtherscanLink] = useState("");
  const [balance, setBalance] = useState("");
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [ownedAssets, setOwnedAssets] = useState([]);

  const {
    authenticate,
    isAuthenticated,
    enableWeb3,
    user,
    Moralis,
    isWeb3Enabled,
  } = useMoralis();

  const {
    data: assetsData,
    error: assetsDataError,
    isLoading: assetsDataIsLoading,
  } = useMoralisQuery("assets");

  const {
    data: userData,
    error: userError,
    isLoading: userDataIsLoading,
  } = useMoralisQuery("_User");

  const getAssets = useCallback(async () => {
    try {
      setAssets(assetsData);
    } catch (err) {
      console.log("##err");
    }
  }, [assetsData]);

  const getOwnedAssets = useCallback(async () => {
    try {
      if (userData[0]?.attributes?.ownedAssets) {
        setOwnedAssets([userData[0].attributes.ownedAssets])
      }
    } catch(err) {
      console.log('##err', err);
    }
  }, [userData]);

  useEffect(() => {
    (async () => {
      if (isWeb3Enabled) {
        await getAssets();
        await getOwnedAssets();
      }
    })();
  }, [getAssets, isWeb3Enabled, getOwnedAssets]);

  const handleSetUsername = () => {
    if (user) {
      if (nickname) {
        user.set("nickname", nickname);
        user.save();
        setNickName("");
      } else {
        console.log("Can't set empty nick name");
      }
    } else {
      console.log("No User!");
    }
  };

  const getBalance = useCallback(async () => {
    try {
      if (!isAuthenticated || !currentAccount) return;
      const options = {
        contractAddress: amazonCoinAddress,
        functionName: "balanceOf",
        abi: amazonAbi,
        params: {
          account: currentAccount,
        },
      };

      if (isWeb3Enabled) {
        const response = await Moralis.executeFunction(options);
        console.log("##balance", response.toString());
        setBalance(response.toString());
      }
    } catch (error) {
      console.log("###Err", error);
    }
  }, [Moralis, currentAccount, isAuthenticated, isWeb3Enabled]);

  const listenToUpdates = useCallback(async () => {
    let query = new Moralis.Query("EthTransactions");
    let subscription = await query.subscribe();
    subscription.on("update", async (object) => {
      console.log("New Transactions", object);
      setRecentTransactions([object]);
    });
  }, [Moralis.Query]);

  useEffect(() => {
    (async () => {
      try {
        if (isAuthenticated) {
          await getBalance();
          await listenToUpdates();
          const currentUserName = await user?.get("nickname");
          setUserName(currentUserName);
          const account = await user?.get("ethAddress");
          setCurrentAccount(account);
        }
      } catch (err) {
        console.log("##err", err);
      }
    })();
  }, [
    isAuthenticated,
    isWeb3Enabled,
    user,
    currentAccount,
    getBalance,
    listenToUpdates,
  ]);

  const buyAsset = async (price, asset) => {
    try {
      if (!isAuthenticated) return;

      const options = {
        type: "erc20",
        amount: price,
        receiver: amazonCoinAddress,
        contractAddress: amazonCoinAddress,
      };

      let transaction = await Moralis.transfer(options);
      const receipt = await transaction.wait();

      if (receipt) {
        const res = userData[0].add("ownedAssets", {
          ...asset,
          purchaseDate: Date.now(),
          etherscanLink: `https://rinkeby.etherscan.io/tx/${receipt.transactionHash}`,
        });

        await res.save().then(() => {
          alert("You've successfully purchased this asset!");
        });
      }
    } catch (err) {
      console.log("##err", err);
    }
  };

  const buyTokens = async () => {
    if (!isAuthenticated) {
      await connectWallet();
    }
    try {
      const amount = ethers.BigNumber.from(tokenAmount);
      const price = ethers.BigNumber.from("100000000000000");
      const calcPrice = amount.mul(price);

      let options = {
        contractAddress: amazonCoinAddress,
        functionName: "mint",
        abi: amazonAbi,
        msgValue: calcPrice,
        params: {
          amount,
        },
      };
      const transaction = await Moralis.executeFunction(options);
      const receipt = await transaction.wait(4);
      setIsLoading(false);
      setEtherscanLink(
        `https://rinkeby.etherscan.io/tx/${receipt.transactionHash}`
      );
    } catch (err) {
      console.log("##err", err);
    }
  };

  return (
    <AmazonContext.Provider
      value={{
        isAuthenticated,
        nickname,
        setNickName,
        username,
        handleSetUsername,
        assets,
        balance,
        setTokenAmount,
        tokenAmount,
        amountDue,
        setAmountDue,
        isLoading,
        setIsLoading,
        etherscanLink,
        setEtherscanLink,
        currentAccount,
        buyTokens,
        buyAsset,
        recentTransactions,
        ownedAssets
      }}
    >
      {children}
    </AmazonContext.Provider>
  );
};

export default AmazonProvider;
