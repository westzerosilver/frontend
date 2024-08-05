import React, { createContext, useContext, useState } from 'react';

const MealContext = createContext();

export const useMealContext = () => {
    return useContext(MealContext);
};

export const MealProvider = ({ children }) => {
    const [mealData, setMealData] = useState({});
    const [currentMealId, setCurrentMealId] = useState(null); // 현재 식사의 ID를 추적

    const addMealData = (id, data) => {
        setMealData((prev) => ({ ...prev, [id]: { ...prev[id], ...data } }));
    };

    const getMealDataById = (id) => {
        return mealData[id] || null;
    };

    const createNewMeal = (data) => {
        const newMealId = Date.now().toString();
        setMealData((prev) => ({ ...prev, [newMealId]: data }));
        setCurrentMealId(newMealId);
        return newMealId;
    };

    return (
        <MealContext.Provider value={{ mealData, addMealData, getMealDataById, createNewMeal, currentMealId, setCurrentMealId }}>
            {children}
        </MealContext.Provider>
    );
};
