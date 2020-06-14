import React, {useEffect, useState} from 'react';
import { DataView } from '@aragon/ui';

import {getAllRegulations} from '../../utils/web3';
import {ESD, ESDS} from "../../constants/tokens";
import {toTokenUnitsBN} from "../../utils/number";
import BigNumber from "bignumber.js";

type RegulationHistoryProps = {
  user: string,
};

type Regulation = {
  type: string,
  data: RegulationEntry
}

type RegulationEntry = {
  epoch: string;
  price: string;
  deltaRedeemable: string;
  deltaDebt: string;
  deltaBonded: string;
}

function formatPrice(type, data) {
  return type === 'NEUTRAL' ? '1.00' : toTokenUnitsBN(new BigNumber(data.price), ESD.decimals).toFixed(2);
}

function formatDeltaRedeemable(type, data) {
  return type === 'INCREASE' ?
    '+' + toTokenUnitsBN(new BigNumber(data.newRedeemable), ESD.decimals).toFixed(2) :
    '+0.00';
}

function formatDeltaDebt(type, data) {
  return type === 'INCREASE' ?
    '-' + toTokenUnitsBN(new BigNumber(data.lessDebt), ESD.decimals).toFixed(2) :
    type === 'DECREASE' ?
      '+' + toTokenUnitsBN(new BigNumber(data.newDebt), ESD.decimals).toFixed(2) :
      '+0.00';
}

function formatDeltaBonded(type, data) {
  return type === 'INCREASE' ?
    '+' + toTokenUnitsBN(new BigNumber(data.newBonded), ESD.decimals).toFixed(2) :
    '+0.00';
}

function renderEntry({ type, data }: Regulation): string[] {
  return [
    data.epoch.toString(),
    formatPrice(type, data),
    formatDeltaRedeemable(type, data),
    formatDeltaDebt(type, data),
    formatDeltaBonded(type, data),
  ]
}

function RegulationHistory({
  user,
}: RegulationHistoryProps) {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [page, setPage] = useState(0)
  const [initialized, setInitialized] = useState(false)

  //Update User balances
  useEffect(() => {
    if (user === '') return;
    let isCancelled = false;

    async function updateUserInfo() {
      const [allRegulations] = await Promise.all([
        getAllRegulations(ESDS.addr),
      ]);

      if (!isCancelled) {
        setRegulations(allRegulations);
        setInitialized(true);
      }
    }

    updateUserInfo();
    const id = setInterval(updateUserInfo, 15000);

    // eslint-disable-next-line consistent-return
    return () => {
      isCancelled = true;
      clearInterval(id);
    };
  }, [user]);

  return (
    <DataView
      fields={['Epoch', 'Price', 'Δ Redeemable', 'Δ Debt', 'Δ Bonded']}
      status={ initialized ? 'default' : 'loading' }
      entries={regulations}
      entriesPerPage={10}
      page={page}
      onPageChange={setPage}
      renderEntry={renderEntry}
    />
  );
}

export default RegulationHistory;
