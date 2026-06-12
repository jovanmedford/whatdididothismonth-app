"use client"
import Square from "../square/square"
import { useState } from "react"

export function HomePageDemo() {
    const [activities, setActivities] = useState(ACTIVITIES)
    const [visible, setVisibile] = useState(ACTIVITIES[0].id)

    const current = activities.find(activity => activity.id == visible)
    if (!current) return null
    const isReached = current.successes.size >= current.target

    function handleToggle(day: number) {
        setActivities(prevActivities => (
            prevActivities.map(activity => activity.id === current!.id ? ({
                ...activity,
                successes: toggleSquare(activity.successes, day)
            }) : activity)
        ))
    }

    return (<div>
        <form>
            <p className="text-center">
                I want to {" "}
                <select id="wdidtm-demo-activity" className="text-primary-400 underline hover:cursor-pointer" value={visible} onChange={(e) => setVisibile(e.target.value)}>
                    {ACTIVITIES.map(activity => <option key={activity.id} value={activity.id}>{activity.label}</option>)}
                </select>
                at least <span className="font-bold">{current?.target} times</span>
            </p>
        </form>
        <div>
            <div className="flex gap-4 w-fit mx-auto mt-8" >
                {SQUARES.map((day) => <Square key={day} day={day} isChecked={current.successes.has(day)} isReached={isReached} onChange={() => handleToggle(day)} />)}
            </div>
        </div>
    </div>)
}


const SQUARES = Array.from({ length: 7 }, (_, i) => i + 1)



function toggleSquare(set: Set<number>, day: number) {
    const newSet = new Set(set)

    if (newSet.has(day)) {
        newSet.delete(day)
    } else {
        newSet.add(day)
    }

    return newSet
}

const ACTIVITIES = [
    {
        id: "walk",
        label: "Walk 10,000 steps",
        target: 3,
        successes: new Set([1, 2])
    },
    {
        id: "gym",
        label: "Hit the gym",
        target: 4,
        successes: new Set([2])
    },
    {
        id: "dsa",
        label: "Do DSA Practice",
        target: 7,
        successes: new Set([2])
    }
]