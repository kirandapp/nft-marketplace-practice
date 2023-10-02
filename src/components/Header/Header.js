import React, { useMemo, useState, useEffect } from "react";
import { HiOutlineLogout } from "react-icons/hi";
// import "./Header.css";
import ConnectWallet from "../ConnectWallet";
import { useWeb3React } from "@web3-react/core";
import { mintNft, buyNft, listNft, editListing, cancelListing } from "../../../utils/calls";
import axios from "axios";
import Web3 from "web3";
import useMarketplace from "../../../hooks/useMarketplace";

const Header = () => {
  const marketplaceContractInstance = useMarketplace();
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
  const [editMode, setEditMode] = useState(false);
  const [showMintedModal, setShowMintedModal] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState(null);

  const MintedModal = () => (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      backgroundColor: 'white',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
    }}>
      <h3>Minted Successfully</h3>
      <p>Your minted NFT ID is: {mintedTokenId}</p>
      <button onClick={() => setShowMintedModal(false)}>Close</button>
    </div>
  );
 
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
      // fetchNFTsFromContract();
    }
  };
  const fetchNFTsFromContract = async () => {
    try {
      const tokenIdsForSale = await marketplaceContractInstance.methods.viewAllNFTsForSale().call();
  
      const nfts = await Promise.all(tokenIdsForSale.map(async tokenId => {
        const nft = await marketplaceContractInstance.methods.nfts(tokenId).call();
        const owner = await marketplaceContractInstance.methods.ownerOf(tokenId).call();
        return {
          tokenId: tokenId,
          tokenURI: nft.tokenURI,
          owner: owner,
          price: nft.price
        };
      }));
  
      setNftsForSale(nfts);
    } catch (error) {
      console.error("Error fetching NFTs from contract:", error);
    }
  };
  

  const fetchNFTDetails = async (tokenId) => {
    try {
      const { data: nftDetails } = await axios.post("/api/salesinglenft", {
        tokenId: Number(tokenId),
      });
      if (nftDetails && nftDetails.isForSale) {
        setFetchedNFT(nftDetails);
      } else {
        alert("input Nft Id is not for sale");
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
      setMintedTokenId(tokenId);
      setShowMintedModal(true);
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
        setTokenURIInput('');
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
    const listPriceinWei = Web3.utils.toWei(listPrice, 'ether')
    if (editMode) {
      await editListing(account, listTokenId, listPriceinWei);
      console.log("Edited NFT - ", listTokenId, listPriceinWei);
    } else {
      await listNft(account, listTokenId, listPriceinWei);
      console.log("call List nft - ",listTokenId, listPriceinWei);
    }
    try {
      const res = await axios.post("/api/updatesale", {
        tokenId: listTokenId,
        price: listPriceinWei,
        isForSale: true
    });
      console.log("Response from server:", res.data);
      fetchNFTsForSale();
      setListTokenId('');
      setListPrice('');
      setSelectedNFT(null);
      setEditMode(false);
    } catch (e) {
      console.error("Error sending POST request:", e);
    }
  };

  const handleEdit = async(tokenId) => {
    console.log("Clicked on edit");
    const nftToEdit = nftsForSale.find(nft => nft.tokenId === tokenId);
    setSelectedNFT(nftToEdit);
    setListTokenId(nftToEdit.tokenId);
    setListPrice(Web3.utils.fromWei(nftToEdit.price.toString(), 'ether'));
    setEditMode(true); // Indicate that it's an edit
    setActiveView('Listforsale');
  }
  const handleCancel = async(tokenId) => {
    console.log("Clicked on Cancel");
    await cancelListing(account, tokenId);
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

  }

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
                { account &&
                <th style={{ border: "1px solid black", padding: "8px" }}>Actions</th>
                }
              </tr>
            </thead>
            <tbody>
              {nftsForSale.map(nft => (
                <tr key={nft.tokenId} onClick={() => handleRowClick(nft)} style={{ cursor: "pointer" }}>
                  <td style={{ border: "1px solid black", padding: "8px" }}>{nft.tokenId}</td>
                  <td style={{ border: "1px solid black", padding: "8px" }}>{nft.tokenURI}</td>
                  <td style={{ border: "1px solid black", padding: "8px" }}>{nft.owner}</td>
                  <td style={{ border: "1px solid black", padding: "8px" }}>{Web3.utils.fromWei(nft.price.toString(), 'ether')} ETH</td>
                  {account &&
                  <td style={{ border: "1px solid black", padding: "8px" }}>
                    <button style={{ backgroundColor: "#4CAF50", color: "white", marginRight: "10px" }} onClick={(e) => { e.stopPropagation(); handleEdit(nft.tokenId); }}>Edit</button>
                    <button style={{ backgroundColor: "#f44336", color: "white" }} onClick={(e) => { e.stopPropagation(); handleCancel(nft.tokenId); }}>Cancel</button>
                  </td>
                  }
                </tr>
              ))}
            </tbody>
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
                <p>Wallet Balance</p>
                <p>{maticBalance}</p>
            </div><br/>
          </div>
          
        {activeView === 'MintNFT' && (
          <div>
            <div>
              <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Token URI:</label>
              <input type='text' placeholder='Token URI'
                value={tokenURIInput} 
                onChange={handleTokenURIInputChange}
                style={{ padding: '5px', border: '1px solid #ccc', borderRadius: '4px', margin: '5px 0' }}
              />
            </div>
            <div className="button-wrapper">
              <button onClick={handleMintNft}
                style={{ padding: '10px 20px', backgroundColor: '#2C7BE5', color: '#fff', borderRadius: '5px', cursor: 'pointer' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#1C6DC5'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#2C7BE5'}
              >
                  Mint NFT
              </button>
            </div>
          </div>
        )}

        {activeView === 'Listforsale' && (
          <div>
            <div>
            <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Token ID:</label>
            <input 
                type="text" 
                placeholder="Enter Token ID to List"
                value={listTokenId}
                onChange={e => !editMode && setListTokenId(e.target.value)}
                readOnly={editMode}
                style={{ padding: '5px', border: '1px solid #ccc', borderRadius: '4px', margin: '5px 0' }}
            />
            </div>
            <div>
            <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Price:</label>
            <input 
                type="text" 
                placeholder="Enter Price in ETH"
                value={listPrice}
                onChange={e => setListPrice(e.target.value)}
                style={{ padding: '5px', border: '1px solid #ccc', borderRadius: '4px', margin: '5px 0' }}
            />
            </div>
            <button onClick={handleListForSale}
              style={{ padding: '10px 20px', backgroundColor: '#2C7BE5', color: '#fff', borderRadius: '5px', cursor: 'pointer' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#1C6DC5'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#2C7BE5'}
            >
            {selectedNFT ? 'Update NFT Price' : 'List NFT for Sale'}
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
                <p><strong>Token ID:</strong> {selectedNFT.tokenId}</p>
                <p><strong>Token URI:</strong> {selectedNFT.tokenURI}</p>
                <p><strong>Owner:</strong> {selectedNFT.owner}</p>
                <p><strong>Price:</strong> {Web3.utils.fromWei(selectedNFT.price.toString(), 'ether')} ETH</p>
                <button onClick={() => handleBuyNFT(selectedNFT.tokenId, selectedNFT.price)}
                  style={{ padding: '10px 20px', backgroundColor: '#2C7BE5', color: '#fff', borderRadius: '5px', cursor: 'pointer' }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = '#1C6DC5'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = '#2C7BE5'}
                >Buy Now</button>
              </div>
            ) : (
              <div>
                <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Token ID to Buy:</label>
                <input 
                  type="text" 
                  placeholder="Enter Token ID to Buy"
                  value={inputTokenId}
                  onChange={e => setInputTokenId(e.target.value)}
                  style={{ padding: '5px', border: '1px solid #ccc', borderRadius: '4px', margin: '5px 0' }}
                />
                {fetchedNFT ? (
                  <div>
                  <p><strong>Token ID:</strong> {fetchedNFT.tokenId}</p>
                  <p><strong>Token URI:</strong> {fetchedNFT.tokenURI}</p>
                  <p><strong>Owner:</strong> {fetchedNFT.owner}</p>
                  <p><strong>Price:</strong> {Web3.utils.fromWei(fetchedNFT.price.toString(), 'ether')} ETH</p>
                  <button onClick={() => handleBuyNFT(fetchedNFT.tokenId, fetchedNFT.price)}
                    style={{ padding: '10px 20px', backgroundColor: '#2C7BE5', color: '#fff', borderRadius: '5px', cursor: 'pointer' }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#1C6DC5'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#2C7BE5'}
                  >Buy Now</button>
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
      {showMintedModal && <MintedModal />}
    </div>
  );
};
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

const MintedModal = () => (
  <div style={{
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '20px',
    backgroundColor: 'white',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
  }}>
    <h3>Minted Successfully</h3>
    <p>Your minted NFT ID is: {mintedTokenId}</p>
    <button onClick={() => setShowMintedModal(false)}>Close</button>
  </div>
);



export default Header;
