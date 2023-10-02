import React, { useMemo, useState, useEffect } from "react";
import { HiOutlineLogout } from "react-icons/hi";
// import "./Header.css";
import ConnectWallet from "../ConnectWallet";
import { useWeb3React } from "@web3-react/core";
import { mintNft, buyNft, listNft } from "../../../utils/calls";
import axios from "axios";
import Web3 from "web3";

const Header = () => {
  const [activeModal, setActiveModal] = useState(false);
  const { account, connector, chainId } = useWeb3React();
  const [maticBalance, setMaticBalance] = useState(0);
  const [tokenURIInput, setTokenURIInput] = useState();
  const [nftsForSale, setNftsForSale] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [activeView, setActiveView] = useState('NFTs');
  const [inputTokenId, setInputTokenId] = useState('');
  const [fetchedNFT, setFetchedNFT] = useState(null);
  const [listTokenId, setListTokenId] = useState('');
  const [listPrice, setListPrice] = useState('');

 
  useEffect(() => {
    fetchNFTsForSale();
  }, []);

  useEffect(() => {
    if (inputTokenId) {
      fetchNFTDetails(inputTokenId);
    }
  }, [inputTokenId]);

  useEffect(() => {
    fetchBalance();
  },account);

  const fetchBalance = async() => {
    try {
        let _web3 = new Web3(window.ethereum);
        const balanceInWei = await _web3.eth.getBalance(account);
        const balance = _web3.utils.fromWei(balanceInWei, 'ether');
        const formattedMaticBalance = parseFloat(balance).toFixed(4);
        console.log("formattedMaticBalance - ",formattedMaticBalance);
        setMaticBalance(formattedMaticBalance);
        return formattedMaticBalance;
    } catch (error) {
        console.error("Error fetching balance:", error);
    }
  }

  const fetchNFTsForSale = async () => {
    try {
      const { data: nftsData } = await axios.post("/api/forsalenfts");
      const nftsAvailableForSale = nftsData.filter(nft => nft.isForSale === true);
      console.log("nftsAvailableForSale ", nftsAvailableForSale);
      setNftsForSale(nftsAvailableForSale);
      // setNftsForSale(nftsData);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }
  };

  const fetchNFTDetails = async (tokenId) => {
    try {
      const { data: nftDetails } = await axios.post("/api/salesinglenft", {
        tokenId: Number(tokenId),
      });
      if (nftDetails) {
        setFetchedNFT(nftDetails);
      }
    } catch (error) {
        console.error("Error fetching NFT details:", error);
    }
  };

  const handleTokenURIInputChange = async(e) => {
    const tokenuri = e.target.value;
    setTokenURIInput(tokenuri);
  }

  const handleMintNft = async () => {
    console.log("clicked",tokenURIInput);
    const nftData = await mintNft(account, tokenURIInput);
    if (nftData) {
      const [tokenId, tokenURI, owner, price, isForSale] = nftData;
      try {
        console.log("Minted NFT Details:");
        console.log("Token ID:", tokenId);
        console.log("Token URI:", tokenURI);
        console.log("Owner:", owner);
        console.log("Price:", price);
        console.log("Is For Sale:", isForSale);
        const res = await axios.post("/api/NftMint", {
          tokenId: tokenId,
          tokenURI: tokenURI,
          owner: owner,
          price: price,
          isForSale: isForSale
      });
        console.log("Response from server:", res.data);
        fetchNFTsForSale();
    } catch (error) {
        console.error("Error sending POST request:", error);
    }
    } else {
        console.error("Failed to mint the NFT or retrieve its details.");
    }
  };

  const handleRowClick = (nft) => {
    console.log("Clicked NFT with Token ID:", nft.tokenId);
    setSelectedNFT(nft);
    setActiveView('BuyNFT');
  };
  const handleBuyNFT = async (tokenId, price) => {
    await buyNft(account, tokenId, price);
    try {
      const res = await axios.post("/api/updatesale", {
        tokenId: tokenId,
        price: 0,
        isForSale: false
    });
      console.log("Response from server:", res.data);
      fetchNFTsForSale();
    } catch (e) {
      console.error("Error sending POST request:", e);
    }
  };

  const handleListForSale = async () => {
    await listNft(account, listTokenId, listPrice);
    console.log("call List nft - ",listTokenId, listPrice);
    try {
      const res = await axios.post("/api/updatesale", {
        tokenId: listTokenId,
        price: listPrice,
        isForSale: true
    });
      console.log("Response from server:", res.data);
      fetchNFTsForSale();
    } catch (e) {
      console.error("Error sending POST request:", e);
    }
  };

  const logout = () => {
    if (connector?.deactivate) {
      connector.deactivate();
    } else {
      connector.resetState();
    }
    localStorage.removeItem("connectedWallet");
  };

  return (
    <div>
      <div>
        <h1>NFT Marketplace</h1>
        <Navbar activeView={activeView} setActiveView={setActiveView} />
        {activeView === 'NFTs' && (
          <div>
          <table style={{ width: "100%", border: "1px solid black" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid black", padding: "8px" }}>Token ID</th>
                <th style={{ border: "1px solid black", padding: "8px" }}>Token URI</th>
                <th style={{ border: "1px solid black", padding: "8px" }}>Owner</th>
                <th style={{ border: "1px solid black", padding: "8px" }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {nftsForSale.map(nft => (
                <tr key={nft.tokenId} onClick={() => handleRowClick(nft)} style={{ cursor: "pointer" }}>
                  <td style={{ border: "1px solid black", padding: "8px" }}>{nft.tokenId}</td>
                  <td style={{ border: "1px solid black", padding: "8px" }}>{nft.tokenURI}</td>
                  <td style={{ border: "1px solid black", padding: "8px" }}>{nft.owner}</td>
                  <td style={{ border: "1px solid black", padding: "8px" }}>{Web3.utils.fromWei(nft.price.toString(), 'ether')} ETH</td>
                  {/* {Web3.utils.fromWei(nft.price.toString(), 'ether')} */}
                </tr>
              ))}
            </tbody>
            {/* {selectedNFT && (
              <div>
                <h3>Buy NFT</h3>
                <p>Token ID: {selectedNFT.tokenId}</p>
                <p>Token URI: {selectedNFT.tokenURI}</p>
                <p>Owner: {selectedNFT.owner}</p>
                <p>Price: {selectedNFT.price} ETH</p>
                <button onClick={() => handleBuyNFT(selectedNFT.tokenId)}>Buy Now</button>
              </div>
            )} */}
          </table>
          </div>
        )}
        {
          account ? (
          <>
          <div className="wallet-wrapper">
            <div className="">
              <button onClick={logout} className='my-text'>
                  <p>{account}</p>
                  <HiOutlineLogout />
              </button>
            </div>
            <div>
                <p>MATIC Balance</p>
                <p>{maticBalance}</p>
            </div>
          </div>
          
        {activeView === 'MintNFT' && (
          <div>
            <div>
              <input type='text' placeholder='Token URI'
                value={tokenURIInput} 
                onChange={handleTokenURIInputChange}
              />
            </div>
            <div className="button-wrapper">
              <button onClick={handleMintNft} >
                  Mint NFT
              </button>
            </div>
          </div>
        )}

        {activeView === 'Listforsale' && (
          <div>
            <input 
                type="text" 
                placeholder="Enter Token ID to List"
                value={listTokenId}
                onChange={e => setListTokenId(e.target.value)}
            />
            <input 
                type="text" 
                placeholder="Enter Price in ETH"
                value={listPrice}
                onChange={e => {
                  const weiValue = Web3.utils.toWei(e.target.value, 'ether');
                  setListPrice(weiValue);
              }}
            />
            <button onClick={handleListForSale}>
                List NFT for Sale
            </button>
          </div>
        )}
        {/* {activeView === 'BuyNFT' && (
          <div>
            <input 
              type="text" 
              placeholder="Enter Token ID to Buy"
              value={inputTokenId}
              onChange={e => setInputTokenId(e.target.value)}
            />
            <button onClick={() => handleBuyNFT(inputTokenId)}>Buy NFT</button>
          </div>
        )} */}

        {activeView === 'BuyNFT' && (
          <div>
            {selectedNFT ? (
              <div>
                <h3>Buy NFT</h3>
                <p>Token ID: {selectedNFT.tokenId}</p>
                <p>Token URI: {selectedNFT.tokenURI}</p>
                <p>Owner: {selectedNFT.owner}</p>
                <p>Price: {Web3.utils.fromWei(selectedNFT.price.toString(), 'ether')} ETH</p>
                <button onClick={() => handleBuyNFT(selectedNFT.tokenId, selectedNFT.price)}>Buy Now</button>
              </div>
            ) : (
              <div>
                <input 
                  type="text" 
                  placeholder="Enter Token ID to Buy"
                  value={inputTokenId}
                  onChange={e => setInputTokenId(e.target.value)}
                />
                {fetchedNFT ? (
                  <div>
                  <p>Token ID: {fetchedNFT.tokenId}</p>
                  <p>Token URI: {fetchedNFT.tokenURI}</p>
                  <p>Owner: {fetchedNFT.owner}</p>
                  <p>Price: {Web3.utils.fromWei(fetchedNFT.price.toString(), 'ether')} ETH</p>
                  <button onClick={() => handleBuyNFT(fetchedNFT.tokenId, fetchedNFT.price)}>Buy Now</button>
                  </div>
                ): null}
              </div>
            )}
          </div>
        )}  
          </>
            ) : (
            <>
            <button onClick={()=>setActiveModal(true)}>Connect wallet</button>
            </>
          )
        }
      </div>
      {activeModal && <ConnectWallet setActiveModal={setActiveModal} />}
    </div>
  );
};

// const Navbar = ({ activeView, setActiveView }) => (
//   <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', marginBottom: '20px' }}>
//     <button onClick={() => setActiveView('NFTs')} className={activeView === 'NFTs' ? 'active' : ''}>NFTs</button>
//     <button onClick={() => setActiveView('MintNFT')} className={activeView === 'MintNFT' ? 'active' : ''}>Mint NFT</button>
//     <button onClick={() => setActiveView('BuyNFT')} className={activeView === 'BuyNFT' ? 'active' : ''}>Buy NFT</button>
//   </div>
// );
const Navbar = ({ activeView, setActiveView }) => (
  <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', marginBottom: '20px' }}>
    <button 
      onClick={() => setActiveView('NFTs')} 
      style={{
        padding: '10px 20px',
        backgroundColor: activeView === 'NFTs' ? '#2C7BE5' : '#fff',
        color: activeView === 'NFTs' ? '#fff' : '#000',
        border: '1px solid #2C7BE5',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
      }}
      onMouseOver={e => e.currentTarget.style.backgroundColor = '#2C7BE5'}
      onMouseOut={e => activeView !== 'NFTs' && (e.currentTarget.style.backgroundColor = '#fff')}
    >
      NFTs
    </button>
    <button 
      onClick={() => setActiveView('MintNFT')} 
      style={{
        padding: '10px 20px',
        backgroundColor: activeView === 'MintNFT' ? '#2C7BE5' : '#fff',
        color: activeView === 'MintNFT' ? '#fff' : '#000',
        border: '1px solid #2C7BE5',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
      }}
      onMouseOver={e => e.currentTarget.style.backgroundColor = '#2C7BE5'}
      onMouseOut={e => activeView !== 'MintNFT' && (e.currentTarget.style.backgroundColor = '#fff')}
    >
      Mint NFT
    </button>
    <button 
      onClick={() => setActiveView('Listforsale')} 
      style={{
        padding: '10px 20px',
        backgroundColor: activeView === 'Listforsale' ? '#2C7BE5' : '#fff',
        color: activeView === 'Listforsale' ? '#fff' : '#000',
        border: '1px solid #2C7BE5',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
      }}
      onMouseOver={e => e.currentTarget.style.backgroundColor = '#2C7BE5'}
      onMouseOut={e => activeView !== 'Listforsale' && (e.currentTarget.style.backgroundColor = '#fff')}
    >
      List NFT
    </button>
    <button 
      onClick={() => setActiveView('BuyNFT')} 
      style={{
        padding: '10px 20px',
        backgroundColor: activeView === 'BuyNFT' ? '#2C7BE5' : '#fff',
        color: activeView === 'BuyNFT' ? '#fff' : '#000',
        border: '1px solid #2C7BE5',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
      }}
      onMouseOver={e => e.currentTarget.style.backgroundColor = '#2C7BE5'}
      onMouseOut={e => activeView !== 'BuyNFT' && (e.currentTarget.style.backgroundColor = '#fff')}
    >
      Buy NFT
    </button>
  </div>
);


export default Header;
