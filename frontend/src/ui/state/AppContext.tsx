import React, { createContext, useContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Entity, defaultEntities, defaultStory } from "./mockData";

// Shape of the context – matches the prototype exactly
export interface AppState {
  story: string;
  setStory: React.Dispatch<React.SetStateAction<string>>;
  disputeType: string;
  setDisputeType: React.Dispatch<React.SetStateAction<string>>;
  entities: Entity[];
  setEntities: React.Dispatch<React.SetStateAction<Entity[]>>;
  removeEntity: (id: number) => void;
  addEntity: (text: string, category: string, type: string) => void;
  toastMessage: string;
  triggerToast: (msg: string) => void;
  showWipeModal: boolean;
  setShowWipeModal: React.Dispatch<React.SetStateAction<boolean>>;
  resetAll: () => void;
}

const AppContext = createContext<AppState | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [story, setStory] = useState<string>(defaultStory);
  const [disputeType, setDisputeType] = useState<string>("deposit");
  const [entities, setEntities] = useState<Entity[]>(defaultEntities);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showWipeModal, setShowWipeModal] = useState<boolean>(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const resetAll = () => {
    setStory(defaultStory);
    setEntities(defaultEntities);
    setDisputeType("deposit");
    setShowWipeModal(false);
  };

  const removeEntity = (id: number) => {
    setEntities(prev => prev.filter(e => e.id !== id));
  };

  const addEntity = (text: string, category: string, type: string) => {
    const nextId = Date.now();
    const token = `{${type} ${entities.length + 1}}`;
    setEntities(prev => [...prev, { id: nextId, text, category, token, locked: true }]);
  };

  return (
    <AppContext.Provider
      value={{
        story,
        setStory,
        disputeType,
        setDisputeType,
        entities,
        setEntities,
        removeEntity,
        addEntity,
        toastMessage,
        triggerToast,
        showWipeModal,
        setShowWipeModal,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
