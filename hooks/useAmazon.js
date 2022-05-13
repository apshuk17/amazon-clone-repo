import { useContext } from "react";
import { AmazonContext } from "../context/AmazonContext";

const useAmazon = () => {
    return useContext(AmazonContext);
};

export default useAmazon;