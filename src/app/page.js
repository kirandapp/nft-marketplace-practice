"use client"
import React, { useState } from 'react';
import Web3Context from "../../context/Web3Context";
import useAutoRefresh from "../../hooks/useAutoRefresh";
import Header from '@/components/Header/Header';
const AutoConnectWrapper = ({ children }) => {
  const autoConnect = useAutoRefresh();
  return <>{children}</>;
};

export default function Home() {

  return (
    <Web3Context>
      <AutoConnectWrapper>
        <Header />
      </AutoConnectWrapper>
    </Web3Context>
  )
}