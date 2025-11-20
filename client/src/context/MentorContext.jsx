import { createContext, useState, useEffect } from 'react'
import axios from 'axios'


export const MentorContext = createContext()


export const MentorProvider = ({ children }) => {
const [mentorProfile, setMentorProfile] = useState(null)
const [loading, setLoading] = useState(true)


useEffect(() => {
const token = localStorage.getItem('mentorToken')
if (!token) return setLoading(false)


axios.get('/api/mentor/me', { headers: { Authorization: `Bearer ${token}` } })
.then(res => setMentorProfile(res.data.mentor))
.finally(() => setLoading(false))
}, [])


const mentorLogin = async (email, password) => {
const res = await axios.post('/api/mentor/login', { email, password })
localStorage.setItem('mentorToken', res.data.token)
setMentorProfile(res.data.mentor)
}


const mentorLogout = () => {
localStorage.removeItem('mentorToken')
setMentorProfile(null)
}


return (
<MentorContext.Provider value={{ mentorProfile, mentorLogin, mentorLogout, loading }}>
{children}
</MentorContext.Provider>
)
}
