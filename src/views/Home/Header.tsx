import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import React from 'react'

const Header = () => {
    return (
        <div className="navbar w-full mb-2 shadow-lg bg-neutral text-neutral-content rounded-box">
           
            <div className="flex-none">
                <WalletMultiButton className="btn btn-ghost" />
            </div>
        </div>
    )
}

export default Header
