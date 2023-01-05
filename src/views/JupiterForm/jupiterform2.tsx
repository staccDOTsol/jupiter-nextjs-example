import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { TokenInfo } from "@solana/spl-token-registry";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { TOKEN_LIST_URL, useJupiter } from "@jup-ag/react-hook";
import {
  CHAIN_ID,
  INPUT_MINT_ADDRESS,
  
} from "../../constants";
const OUTPUT_MINT_ADDRESS= "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
import FeeInfo from "./FeeInfo";
import SpinnerProgress from "./SpinnerProgress";
import fetch from "cross-fetch";
import JSBI from "jsbi";
import Decimal from "decimal.js";
import { SECOND_TO_REFRESH } from "../../pages/_app";
import { getPlatformFeeAccounts } from "@jup-ag/core";

interface IJupiterFormProps {}
type UseJupiterProps = Parameters<typeof useJupiter>[0];

const JupiterForm2: FunctionComponent<IJupiterFormProps> = (props) => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map());
  const [platformFeeAndAccounts, setBonkin] = useState<any>()
 setTimeout(async function(){
  
  setBonkin(
  {
    feeBps: 138, //burnhalf
    feeAccounts: await getPlatformFeeAccounts(
      connection,
      new PublicKey("Gf3sbc5Jb62jH7WcTr3WSNGDQLk1w6wcKMZXKK1SC1E6") // The platform fee account owner
    ), // map of mint to token account pubkey
  })
})
  const [formValue, setFormValue] = useState<
    Omit<UseJupiterProps, "amount"> & { amount: Decimal, platformFeeAndAccounts: any } 
  >({
    amount: new Decimal(1), // unit in lamports (Decimals)
    inputMint: new PublicKey(INPUT_MINT_ADDRESS),
    outputMint: new PublicKey(OUTPUT_MINT_ADDRESS),
    slippage: 1, // 0.1%
    platformFeeAndAccounts
  });

  const [inputTokenInfo, outputTokenInfo] = useMemo(() => {
    return [
      tokenMap.get(formValue.inputMint?.toBase58() || ""),
      tokenMap.get("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" || ""),
    ];
  }, [
    tokenMap,
    formValue.inputMint?.toBase58(),
    "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  ]);

  useEffect(() => {
    fetch(TOKEN_LIST_URL["mainnet-beta"])
      .then((res) => res.json())
      .then((tokens: TokenInfo[]) => {
        setTokenMap(
          tokens.reduce((map, item) => {
            map.set(item.address, item);
            return map;
          }, new Map())
        );
      });
  }, [setTokenMap]);

  const amountInInteger = useMemo(() => {
    return JSBI.BigInt(
      formValue.amount.mul(10 ** (inputTokenInfo?.decimals || 1))
    );
  }, [inputTokenInfo, formValue.amount]);

  const {
    routeMap,
    allTokenMints,
    routes,
    loading,
    exchange,
    error,
    refresh,
    lastRefreshTimestamp,
  } = useJupiter({ ...formValue, amount: amountInInteger });

  const validOutputMints = ["DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"]
  

  // ensure outputMint can be swapable to inputMint
  useEffect(() => {
    if (formValue.inputMint) {
      const possibleOutputs = routeMap.get(formValue.inputMint.toBase58());

      if (
      (formValue.inputMint?.toBase58() == "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" || "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" == "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263")
        && possibleOutputs &&
        !possibleOutputs?.includes("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" || "")
      ) {
        
        setFormValue((val) => ({
          ...val,
           // @ts-ignore
          outputMint: new PublicKey(possibleOutputs[0]),
        }));
      }
    }
  }, [formValue.inputMint?.toBase58(), "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"]);

  const [timeDiff, setTimeDiff] = useState(lastRefreshTimestamp);
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (loading) return;

      const diff = new Date().getTime() - lastRefreshTimestamp;
      setTimeDiff((diff / SECOND_TO_REFRESH) * 100);

      if (diff >= SECOND_TO_REFRESH) {
        refresh();
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [loading]);

  return (
    <div className="max-w-full md:max-w-lg">
      <div className="mb-2">
        <label htmlFor="inputMint" className="block text-sm font-medium">
          Input token
        </label>
        <select
          id="inputMint"
          name="inputMint"
          className="mt-1 bg-neutral block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={formValue.inputMint?.toBase58()}
          onChange={(e) => {
            const pbKey = new PublicKey(e.currentTarget.value);
            if (pbKey) {
              setFormValue((val) => ({
                ...val,
                inputMint: pbKey,
              }));
            }
          }}
        >
          {allTokenMints
            .map((tokenMint) => {
              const found = tokenMap.get(tokenMint);

              return (
                <option key={tokenMint} value={tokenMint}>
                  {found ? found.symbol : tokenMint}
                </option>
              );
            })
            .filter(Boolean)}
        </select>
      </div>

      <div className="mb-2">
        <label htmlFor="outputMint" className="block text-sm font-medium">
          Output token
        </label>
        <select
          id="outputMint"
          name="outputMint"
          className="mt-1 bg-neutral block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={"DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"}
          onChange={(e) => {
            const pbKey = new PublicKey(e.currentTarget.value);
            if (pbKey) {
              setFormValue((val) => ({
                ...val,
                outputMint: pbKey,
              }));
            }
          }}
        >
          {validOutputMints.map((tokenMint) => {
            const found = tokenMap.get(tokenMint);

            return (
              <option key={tokenMint} value={tokenMint}>
                {found ? found.symbol : tokenMint}
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium">
          Input Amount ({inputTokenInfo?.symbol})
        </label>
        <div className="mt-1">
          <input
            name="amount"
            id="amount"
            className="shadow-sm bg-neutral p-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            value={formValue.amount.toString()}
            type="text"
            pattern="[0-9]*"
            onInput={(e: any) => {
              let newValue = e.target?.value || "0";

              let newAmount = new Decimal(newValue);

              if (newAmount.lessThan(0)) {
                newAmount = new Decimal(0);
              }
              setFormValue((val) => ({
                ...val,
                amount: newAmount,
              }));
            }}
          />
        </div>
      </div>

      <div className="flex justify-center items-center mt-4">
        <button
          className={`${
            loading ? "opacity-50 cursor-not-allowed" : ""
          } inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 space-x-2`}
          type="button"
          onClick={refresh}
          disabled={loading}
        >
          <SpinnerProgress percentage={timeDiff} sqSize={18} strokeWidth={2} />
          <span>{loading ? "Loading" : "Refresh"}</span>
        </button>
      </div>

      <div>Total routes: {routes?.length}</div>

      {routes?.[0] &&
        (() => {
          const route = routes[0];
          return (
            <div>
              <div>
                Best route info :{" "}
                {route.marketInfos.map((info) => info.label).join(" -> ")}
              </div>
              <div>
                Output:{" "}
                {new Decimal(route.outAmount.toString())
                  .div(10 ** (5))
                  .toString()}{" "}
                Bonk
              </div>
              <FeeInfo route={route} />
            </div>
          );
        })()}

      {error && <div>Error in Jupiter, try changing your intpu</div>}

      <div className="flex justify-center mt-4">
        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            if (
              !loading &&
              routes?.[0] &&
              wallet.signAllTransactions &&
              wallet.signTransaction &&
              wallet.sendTransaction &&
              wallet.publicKey
            ) {
              const swapResult = await exchange({
                userPublicKey: wallet.publicKey,
                wallet: {
                  sendTransaction: wallet.sendTransaction,
                  signAllTransactions: wallet.signAllTransactions,
                  signTransaction: wallet.signTransaction,
                },
                routeInfo: routes[0],
                onTransaction: async (txid) => {
                  console.log("sending transaction");
                },
              });

              console.log({ swapResult });

              if ("error" in swapResult) {
                console.log("Error:", swapResult.error);
              } else if ("txid" in swapResult) {
                console.log("Sucess:", swapResult.txid);
                console.log("Input:", swapResult.inputAmount);
                console.log("Output:", swapResult.outputAmount);
              }
            }
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Swap Best Route
        </button>
      </div>
    </div>
  );
};

export default JupiterForm2;
