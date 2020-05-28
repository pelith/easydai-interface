import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from 'react'

import WrongNetworkDialog from '../components/dialogs/WrongNetworkDialog'
import WalletDialog from '../components/dialogs/WalletDialog'
import TrialWalletDialog from '../components/dialogs/TrialWalletDialog'
import CreateSuccessDialog from '../components/dialogs/CreateSuccessDialog'
import TransferDialog from '../components/dialogs/TransferDialog'
import WithdrawDialog from '../components/dialogs/WithdrawDialog'

const DialogsContext = createContext()

export function useDialogsContext() {
  return useContext(DialogsContext)
}

const OPEN = 'OPEN'
const CLOSE = 'CLOSE'

export const WRONG_NETWORK = 'WRONG_NETWORK'
export const WALLET = 'WALLET'
export const TRIAL_WALLET = 'TRIAL_WALLET'
export const CREATE_SUCCESS = 'CREATE_SUCCESS'
export const TRANSFER = 'TRANSFER'
export const WITHDRAW = 'WITHDRAW'

const INITIAL_STATES = {
  isOpen: false,
  dialogName: '',
}

function reducer(state, { type, payload }) {
  switch (type) {
    case OPEN: {
      const { dialogName } = payload
      return {
        isOpen: true,
        dialogName,
      }
    }
    case CLOSE: {
      return {
        isOpen: false,
        dialogName: '',
      }
    }
    default: {
      return {
        isOpen: false,
        dialogName: '',
      }
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATES)

  const open = useCallback(dialogName => {
    dispatch({ type: OPEN, payload: { dialogName } })
  }, [])

  const close = useCallback(() => {
    dispatch({ type: CLOSE })
  }, [])

  const value = useMemo(() => [state, { open, close }], [state, open, close])

  return (
    <DialogsContext.Provider value={value}>{children}</DialogsContext.Provider>
  )
}

export function Dialogs() {
  const [{ isOpen, dialogName }, { open, close }] = useDialogsContext()

  return (
    <>
      <WrongNetworkDialog
        isOpen={isOpen && dialogName === WRONG_NETWORK}
        onDismiss={close}
      />
      <WalletDialog
        isOpen={isOpen && dialogName === WALLET}
        onDismiss={close}
        onCreateTrialWallet={() => open(CREATE_SUCCESS)}
        onImportTrialWallet={() => open(TRIAL_WALLET)}
        onDecryptTrialWallet={() => open(TRIAL_WALLET)}
      />
      <TrialWalletDialog
        isOpen={isOpen && dialogName === TRIAL_WALLET}
        onDismiss={close}
        onTransfer={() => open(TRANSFER)}
      />
      <CreateSuccessDialog
        isOpen={isOpen && dialogName === CREATE_SUCCESS}
        onDismiss={close}
        onStart={() => open(TRIAL_WALLET)}
      />
      <TransferDialog
        isOpen={isOpen && dialogName === TRANSFER}
        onDismiss={close}
        onCancel={() => open(TRIAL_WALLET)}
      />
      <WithdrawDialog
        isOpen={isOpen && dialogName === WITHDRAW}
        onDismiss={close}
      />
    </>
  )
}
