import React, { useState } from 'react';

import {
  Button, IdentityBadge, IconConnect, Box, IconPower, LinkBase,
} from '@aragon/ui';

import { connect } from '../../utils/web3';

type connectButtonProps = {
  user: string,
  setUser: Function
}

function ConnectButton({ user, setUser }: connectButtonProps) {
  const [isConnected, setIsConnected] = useState(false);

  const connectWeb3 = async () => {
    const address = await connect();
    if (address === false) return;
    setIsConnected(true);
    setUser(address);
  };

  const disconnectWeb3 = async () => {
    setIsConnected(false);
    setUser('');
  };

  return isConnected ? (
    <>
      <div style={{ paddingTop: 5, paddingRight: 5 }}>
        <LinkBase onClick={disconnectWeb3} size="small">
          {' '}
          <IconPower />
          {' '}
        </LinkBase>
      </div>
      <Box padding={6}>
        <IdentityBadge entity={user} />
      </Box>

    </>
  ) : (
    <Button icon={<IconConnect />} label="Connect" onClick={connectWeb3} />
  );
}


export default ConnectButton;
