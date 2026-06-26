import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { api } from './api/api'
import designSettingsReducer from './features/designSettings/designSettings.slice'
import myCardReducer from './features/myCard/myCard.slice'
import vcardsReducer from './features/vcards/vcards.slice'

const persistConfig = {
  key: 'root',
  storage,
}

const persistVcardsReducer = persistReducer({ ...persistConfig, key: 'vcards' }, vcardsReducer)
const persistDesignReducer = persistReducer({ ...persistConfig, key: 'designSettings' }, designSettingsReducer)

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  myCard: myCardReducer,
  vcards: persistVcardsReducer,
  designSettings: persistDesignReducer,
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
