import { useState, createContext, useEffect } from "react"

interface props {
    children: JSX.Element | JSX.Element[]
}

const CalendarContext = createContext({})

const CalendarProvider = ({children}: props) => {

    

    return (
        <CalendarContext.Provider
            value={{
               
            }}
        >
            {children}
        </CalendarContext.Provider>
    )
}

export {CalendarProvider}

export default CalendarContext