import React, { createContext, useContext, useState } from "react";

// Create context to store active tab
const TabsContext = createContext();

export function Tabs({ defaultValue, children, className }) {
    const [active, setActive] = useState(defaultValue);

    return (
        <TabsContext.Provider value={{ active, setActive }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
}

export function TabsList({ children, className }) {
    return (
        <div className={`flex items-center gap-2 ${className || ""}`}>
            {children}
        </div>
    );
}

export function TabsTrigger({ value, children, className }) {
    const { active, setActive } = useContext(TabsContext);

    const isActive = active === value;

    return (
        <button
            onClick={() => setActive(value)}
            className={`
        px-4 py-2 rounded-md font-medium transition-all duration-200
        ${isActive ? "bg-green-600 text-white shadow" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}
        ${className || ""}
      `}
        >
            {children}
        </button>
    );
}

export function TabsContent({ value, children, className }) {
    const { active } = useContext(TabsContext);

    if (active !== value) return null;

    return <div className={className}>{children}</div>;
}
