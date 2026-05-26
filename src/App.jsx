import { useEffect, useState, useRef } from 'react'
const API_URL = import.meta.env.VITE_API_URL

// ── Time rules ──
// อา(0) จ(1) อ(2) พ(3) พฤ(4) → last slot 21:00
// ศ(5) ส(6) → last slot 20:30
const TIMES_LONG  = ['19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30'] // ศุกร์-เสาร์
const TIMES_SHORT = ['19:00','19:30','20:00','20:30','21:00']                          // อา-พฤ

// เพื่อ simplicity: ร้านเปิดทุกวัน แต่ last released slot ต่างกัน
// วันศุกร์(5) เสาร์(6) → TIMES_LONG, อื่น → TIMES_SHORT
function getTimesForDate(dateStr) {
  if (!dateStr) return TIMES_LONG
  const d = new Date(dateStr)
  const dow = d.getDay()
  return (dow === 5 || dow === 6) ? TIMES_LONG : TIMES_SHORT
}

// ── Table pairs ──
const TABLE_PAIRS = {
  'A10': 'A11', 'A11': 'A10',
  'A20': 'A21', 'A21': 'A20',
  'A26': 'A27', 'A27': 'A26',
  'A36': 'A37', 'A37': 'A36',
  'A42': 'A43', 'A43': 'A42',
}

// ── Calendar helpers ──
const MONTH_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
const MONTH_TH_FULL = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']
const DAY_NAMES = ['อา','จ','อ','พ','พฤ','ศ','ส']
const DAY_FULL  = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัส','ศุกร์','เสาร์']

function getDaysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate()
}
function getFirstDayOfWeek(y, m) {
  return new Date(y, m, 1).getDay()
}
function toDateStr(y, m, d) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
}
function parseDateStr(s) {
  if (!s) return null
  const [y, m, d] = s.split('-').map(Number)
  return { y, m: m-1, d }
}
function getTodayStr() {
  const n = new Date()
  return toDateStr(n.getFullYear(), n.getMonth(), n.getDate())
}
function getTomorrowStr() {
  const n = new Date()
  n.setDate(n.getDate() + 1)
  return toDateStr(n.getFullYear(), n.getMonth(), n.getDate())
}
function getDayOfWeek(dateStr) {
  return new Date(dateStr).getDay()
}
function getDayName(dateStr) {
  return DAY_FULL[getDayOfWeek(dateStr)]
}

// ── Constants ──
const R = 12
const mk = (id, x, y, z) => ({ id, x, y, z })

const TABLES = [
  mk('A1',55,172,'A'),mk('A2',55,202,'A'),mk('A3',55,245,'A'),
  mk('A4',55,275,'A'),mk('A5',55,305,'A'),
  mk('A6',85,172,'A'),mk('A7',85,202,'A'),
  mk('A8',115,172,'A'),mk('A9',115,202,'A'),
  mk('A10',115,232,'A'),mk('A11',155,232,'A'),
  mk('A12',136,275,'A'),mk('A13',136,305,'A'),
  mk('A14',180,285,'A'),mk('A15',180,315,'A'),
  mk('A16',195,110,'A'),mk('A17',195,140,'A'),
  mk('A18',175,180,'A'),mk('A19',215,180,'A'),
  mk('A20',200,230,'A'),mk('A21',240,230,'A'),
  mk('A22',222,285,'A'),mk('A23',222,315,'A'),
  mk('A24',265,130,'A'),mk('A25',265,180,'A'),
  mk('A26',280,230,'A'),mk('A27',305,230,'A'),
  mk('A28',268,285,'A'),mk('A29',268,315,'A'),
  mk('A30',305,130,'A'),mk('A31',305,180,'A'),
  mk('A32',325,275,'A'),mk('A33',325,305,'A'),
  mk('A34',350,130,'A'),mk('A35',350,180,'A'),
  mk('A36',354,230,'A'),mk('A37',380,230,'A'),
  mk('A38',370,285,'A'),mk('A39',370,315,'A'),
  mk('A40',390,130,'A'),mk('A41',390,180,'A'),
  mk('A42',415,230,'A'),mk('A43',440,230,'A'),
  mk('A44',415,275,'A'),mk('A45',435,300,'A'),
  mk('A46',445,265,'A'),mk('A47',440,130,'A'),
  mk('A48',440,180,'A'),
  mk('D1',510,180,'D'),mk('D2',510,230,'D'),
  mk('D3',540,180,'D'),mk('D4',540,230,'D'),
  mk('D5',570,180,'D'),mk('D6',570,230,'D'),
  mk('B1',55,348,'B'),mk('B2',55,378,'B'),
  mk('B3',55,408,'B'),mk('B4',55,438,'B'),
  mk('B5',100,348,'B'),mk('B6',100,378,'B'),
  mk('B7',100,408,'B'),mk('B8',100,438,'B'),
  mk('B9',150,348,'B'),mk('B10',150,378,'B'),
  mk('B11',150,408,'B'),mk('B12',150,438,'B'),
  mk('B13',200,408,'B'),mk('B14',200,438,'B'),
  mk('B15',250,408,'B'),mk('B16',250,438,'B'),
  mk('B17',310,348,'B'),mk('B18',310,378,'B'),
  mk('B19',350,378,'B'),mk('B20',326,406,'B'),
  mk('B21',305,438,'B'),mk('B22',385,378,'B'),
  mk('B23',365,406,'B'),mk('B24',345,438,'B'),
  mk('C1',55,485,'C'),mk('C2',55,525,'C'),
  mk('C3',120,485,'C'),mk('C4',120,525,'C'),
  mk('C5',185,485,'C'),mk('C6',185,525,'C'),
  mk('C7',245,485,'C'),mk('C8',245,525,'C'),
  mk('C9',305,485,'C'),mk('C10',305,525,'C'),
]

const ZC = {
  A:{free:'#c0392b',book:'#2a0808',sel:'#d4890a',hov:'#e04535',pair:'#b05000'},
  B:{free:'#922b21',book:'#200606',sel:'#b07208',hov:'#b03528',pair:'#904000'},
  C:{free:'#6e1c14',book:'#180404',sel:'#905a08',hov:'#882218',pair:'#703000'},
  D:{free:'#8b4513',book:'#241208',sel:'#a06010',hov:'#a85520',pair:'#804010'},
}

// ── useIsMobile ──
function useIsMobile() {
  const [m,setM] = useState(window.innerWidth<=768)
  useEffect(()=>{
    const fn=()=>setM(window.innerWidth<=768)
    window.addEventListener('resize',fn)
    return ()=>window.removeEventListener('resize',fn)
  },[])
  return m
}

// ── Calendar Picker ──
function CalendarPicker({ date, onDate, onClose }) {
  const today = getTodayStr()
  const tomorrow = getTomorrowStr()
  const initial = date ? parseDateStr(date) : parseDateStr(tomorrow)
  const [viewY, setViewY] = useState(initial.y)
  const [viewM, setViewM] = useState(initial.m)
  const [hov, setHov] = useState(null)

  const daysInMonth = getDaysInMonth(viewY, viewM)
  const firstDow = getFirstDayOfWeek(viewY, viewM)
  const cells = []
  for (let i=0; i<firstDow; i++) cells.push(null)
  for (let d=1; d<=daysInMonth; d++) cells.push(d)

  const isAvailable = (day) => {
    const ds = toDateStr(viewY, viewM, day)
    return ds > today // จองได้วันพรุ่งนี้เป็นต้นไป (ล่วงหน้า ≥1 วัน)
  }

  const prevMonth = () => {
    if (viewM === 0) { setViewY(y=>y-1); setViewM(11) } else setViewM(m=>m-1)
  }
  const nextMonth = () => {
    if (viewM === 11) { setViewY(y=>y+1); setViewM(0) } else setViewM(m=>m+1)
  }

  const selectedParsed = date ? parseDateStr(date) : null

  return (
    <div style={{
      background:'#0e0101', border:'1px solid rgba(192,57,43,0.35)',
      borderRadius:12, padding:16, width:290,
      boxShadow:'0 24px 60px rgba(0,0,0,0.95)',
    }}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <button onClick={prevMonth} style={{
          background:'rgba(255,255,255,0.05)',border:'none',borderRadius:6,
          width:28,height:28,cursor:'pointer',color:'rgba(255,255,255,0.6)',
          fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',
        }}>‹</button>
        <span style={{fontSize:13,fontWeight:700,color:'rgba(255,255,255,0.85)',letterSpacing:0.5}}>
          {MONTH_TH_FULL[viewM]} {viewY}
        </span>
        <button onClick={nextMonth} style={{
          background:'rgba(255,255,255,0.05)',border:'none',borderRadius:6,
          width:28,height:28,cursor:'pointer',color:'rgba(255,255,255,0.6)',
          fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',
        }}>›</button>
      </div>
      {/* Day names */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,marginBottom:4}}>
        {DAY_NAMES.map(d=>(
          <div key={d} style={{
            textAlign:'center',fontSize:9,fontWeight:700,padding:'2px 0',
            color:d==='อา'||d==='ส'?'rgba(192,57,43,0.6)':'rgba(255,255,255,0.2)',
          }}>{d}</div>
        ))}
      </div>
      {/* Days */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>
        {cells.map((day,i)=>{
          if(!day) return <div key={i}/>
          const avail = isAvailable(day)
          const ds = toDateStr(viewY,viewM,day)
          const isSel = selectedParsed && selectedParsed.y===viewY && selectedParsed.m===viewM && selectedParsed.d===day
          const isHov = hov===day && avail
          const dow = (firstDow+day-1)%7
          const isWeekend = dow===0||dow===6
          return (
            <button key={i}
              onClick={()=>{ if(avail){ onDate(ds); onClose() } }}
              onMouseEnter={()=>avail&&setHov(day)}
              onMouseLeave={()=>setHov(null)}
              style={{
                height:32,borderRadius:6,border:'none',
                cursor:avail?'pointer':'default',fontFamily:'inherit',
                background:isSel?'#c0392b':isHov?'rgba(192,57,43,0.2)':avail?'rgba(255,255,255,0.04)':'transparent',
                color:isSel?'#fff':avail?(isWeekend?'rgba(255,150,130,0.9)':'rgba(255,255,255,0.82)'):'rgba(255,255,255,0.15)',
                fontSize:12,fontWeight:isSel?700:avail?400:300,
                outline:isSel?'none':isHov?'1px solid rgba(192,57,43,0.4)':'none',
                transition:'all 0.1s',position:'relative',
              }}>
              {day}
              {avail&&!isSel&&(
                <span style={{
                  position:'absolute',bottom:3,left:'50%',transform:'translateX(-50%)',
                  width:3,height:3,borderRadius:'50%',background:'rgba(192,57,43,0.5)',
                }}/>
              )}
            </button>
          )
        })}
      </div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
        <div style={{fontSize:9,color:'rgba(255,255,255,0.18)',letterSpacing:0.5}}>
          จองล่วงหน้าได้ตั้งแต่พรุ่งนี้
        </div>
        <button onClick={onClose} style={{
          background:'rgba(255,255,255,0.05)',border:'none',borderRadius:5,
          padding:'3px 10px',cursor:'pointer',color:'rgba(255,255,255,0.4)',
          fontSize:10,fontFamily:'inherit',
        }}>ปิด</button>
      </div>
    </div>
  )
}

// ── Time Picker ──
function TimePicker({ time, dateStr, onTime, onClose }) {
  const times = getTimesForDate(dateStr)
  const dow = dateStr ? getDayOfWeek(dateStr) : -1
  const isLong = dow===5||dow===6

  return (
    <div style={{
      background:'#0e0101',border:'1px solid rgba(192,57,43,0.35)',
      borderRadius:12,padding:14,width:210,
      boxShadow:'0 24px 60px rgba(0,0,0,0.95)',
    }}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
        <div>
          <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.5)',letterSpacing:2}}>SELECT TIME</div>
          {dateStr&&(
            <div style={{fontSize:9,color:'rgba(255,255,255,0.25)',marginTop:2}}>
              {isLong?'ถึง 22:30':'ถึง 21:00'}
            </div>
          )}
        </div>
        <button onClick={onClose} style={{
          background:'rgba(255,255,255,0.06)',border:'none',borderRadius:5,
          width:24,height:24,cursor:'pointer',color:'rgba(255,255,255,0.5)',
          fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',
        }}>×</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4}}>
        {times.map(tm=>(
          <button key={tm} onClick={()=>{onTime(tm);onClose()}} style={{
            padding:'10px 0',borderRadius:7,border:'none',cursor:'pointer',fontFamily:'inherit',
            background:time===tm?'rgba(192,57,43,0.28)':'rgba(255,255,255,0.04)',
            outline:time===tm?'1px solid rgba(192,57,43,0.6)':'1px solid rgba(255,255,255,0.06)',
            color:time===tm?'#f0a020':'rgba(255,255,255,0.7)',
            fontSize:13,fontWeight:time===tm?700:400,letterSpacing:0.5,transition:'all 0.1s',
          }}>{tm}</button>
        ))}
      </div>
    </div>
  )
}

// ── Admin Popup ──
function AdminPopup({ onSuccess, onClose }) {
  const [pw,setPw]=useState('')
  const [err,setErr]=useState(false)
  const [shake,setShake]=useState(false)
  const ref=useRef(null)
  useEffect(()=>{ ref.current?.focus() },[])
  const submit=()=>{
    if(pw==='duem2026'){ onSuccess() }
    else { setErr(true); setShake(true); setPw(''); setTimeout(()=>setShake(false),500) }
  }
  return (
    <div style={{
      position:'fixed',inset:0,zIndex:1000,
      background:'rgba(0,0,0,0.85)',backdropFilter:'blur(6px)',
      display:'flex',alignItems:'center',justifyContent:'center',
    }} onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{
        background:'#0e0101',border:'1px solid rgba(192,57,43,0.3)',
        borderRadius:14,padding:'28px 24px',width:320,
        boxShadow:'0 32px 80px rgba(0,0,0,0.95)',
        animation:shake?'shake 0.4s ease':'none',
      }}>
        <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
        <div style={{
          width:44,height:44,borderRadius:10,
          background:'rgba(192,57,43,0.15)',border:'1px solid rgba(192,57,43,0.3)',
          display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14,
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="4" y="9" width="12" height="9" rx="2" stroke="rgba(192,57,43,0.8)" strokeWidth="1.5"/>
            <path d="M7 9V6a3 3 0 016 0v3" stroke="rgba(192,57,43,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="10" cy="13.5" r="1.5" fill="rgba(192,57,43,0.8)"/>
          </svg>
        </div>
        <div style={{fontSize:15,fontWeight:700,color:'rgba(255,255,255,0.88)',marginBottom:4}}>Staff Access</div>
        <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginBottom:20}}>รหัสผ่านสำหรับพนักงาน</div>
        <input ref={ref} type="password" placeholder="Password"
          value={pw} onChange={e=>{setPw(e.target.value);setErr(false)}}
          onKeyDown={e=>e.key==='Enter'&&submit()}
          style={{
            width:'100%',height:42,padding:'0 14px',borderRadius:7,boxSizing:'border-box',
            border:err?'1px solid rgba(231,76,60,0.7)':'1px solid rgba(255,255,255,0.1)',
            background:err?'rgba(231,76,60,0.08)':'rgba(255,255,255,0.05)',
            color:'#fff',fontSize:14,fontFamily:'inherit',outline:'none',letterSpacing:2,
          }}/>
        {err&&<div style={{fontSize:10,color:'#e74c3c',marginTop:6}}>รหัสผ่านไม่ถูกต้อง</div>}
        <div style={{display:'flex',gap:8,marginTop:16}}>
          <button onClick={onClose} style={{
            flex:1,height:38,borderRadius:7,border:'1px solid rgba(255,255,255,0.08)',
            background:'transparent',color:'rgba(255,255,255,0.3)',fontSize:12,
            cursor:'pointer',fontFamily:'inherit',
          }}>ยกเลิก</button>
          <button onClick={submit} style={{
            flex:2,height:38,borderRadius:7,border:'none',
            background:'#b83228',color:'#fff',fontSize:13,fontWeight:700,
            cursor:'pointer',fontFamily:'inherit',
            boxShadow:'0 2px 12px rgba(184,50,40,0.4)',
          }}>เข้าสู่ระบบ</button>
        </div>
      </div>
    </div>
  )
}

// ── Bottom Sheet (เด้งขึ้นเมื่อเลือกโต๊ะ) ──
function BottomSheet({ selected, pairTable, form, onProceed, onDeselect, onPairToggle, isPairSelected }) {
  const hasPair = !!pairTable
  const isReady = form.booking_date && form.booking_time

  return (
    <div style={{
      position:'fixed',bottom:0,left:0,right:0,zIndex:400,
      background:'#0d0000',
      borderTop:'1px solid rgba(192,57,43,0.3)',
      borderRadius:'16px 16px 0 0',
      padding:'14px 16px 24px',
      boxShadow:'0 -8px 32px rgba(0,0,0,0.7)',
      animation:'slideUp 0.22s ease',
    }}>
      <style>{`@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

      {/* Handle bar */}
      <div style={{width:36,height:3,background:'rgba(255,255,255,0.12)',borderRadius:2,margin:'0 auto 14px'}}/>

      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12}}>
        {/* Left: table info */}
        <div style={{display:'flex',alignItems:'center',gap:12,flex:1,minWidth:0}}>
          <div style={{flexShrink:0}}>
            <div style={{
              width:42,height:42,borderRadius:8,
              background:'rgba(192,57,43,0.2)',border:'1px solid rgba(192,57,43,0.4)',
              display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
            }}>
              <span style={{fontSize:6,color:'rgba(255,255,255,0.3)',fontWeight:700,letterSpacing:1}}>TBL</span>
              <span style={{fontSize:14,fontWeight:800,color:'#f0a020',lineHeight:1}}>{selected}</span>
            </div>
          </div>
          <div style={{minWidth:0}}>
            <div style={{fontSize:8,color:'rgba(255,255,255,0.2)',fontWeight:700,letterSpacing:2,marginBottom:3}}>SELECTED</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.6)',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              {isReady ? `${form.booking_date}  ·  ${form.booking_time}` : 'เลือกวันและเวลาก่อน'}
            </div>
            {/* Pair option */}
            {hasPair && (
              <button onClick={onPairToggle} style={{
                marginTop:6,display:'flex',alignItems:'center',gap:5,
                background:'transparent',border:'none',cursor:'pointer',padding:0,fontFamily:'inherit',
              }}>
                <div style={{
                  width:14,height:14,borderRadius:3,border:`1.5px solid ${isPairSelected?'#d4890a':'rgba(255,255,255,0.25)'}`,
                  background:isPairSelected?'rgba(212,137,10,0.2)':'transparent',
                  display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s',
                }}>
                  {isPairSelected&&<svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="#f0a020" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                </div>
                <span style={{fontSize:10,color:isPairSelected?'#f0a020':'rgba(255,255,255,0.4)',fontWeight:isPairSelected?600:400}}>
                  ต่อโต๊ะ {pairTable}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Right: buttons */}
        <div style={{display:'flex',gap:7,flexShrink:0}}>
          <button onClick={onDeselect} style={{
            height:36,padding:'0 12px',borderRadius:7,
            border:'1px solid rgba(255,255,255,0.08)',background:'transparent',
            color:'rgba(255,255,255,0.3)',fontSize:11,cursor:'pointer',fontFamily:'inherit',
          }}>ยกเลิก</button>
          <button onClick={onProceed} style={{
            height:36,padding:'0 16px',borderRadius:7,border:'none',
            background:'#b83228',color:'#fff',fontSize:11,fontWeight:700,
            cursor:'pointer',fontFamily:'inherit',letterSpacing:0.8,
            boxShadow:'0 2px 12px rgba(184,50,40,0.45)',
          }}>จองโต๊ะนี้</button>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────
export default function App() {
  const isMobile = useIsMobile()
  const [bookings,setBookings] = useState([])
  const [barTables,setBarTables] = useState([])
  const [bookedIds,setBookedIds] = useState(new Set())
  const [selected,setSelected] = useState(null)
  const [pairSelected,setPairSelected] = useState(false)
  const [hov,setHov] = useState(null)
  const [form,setForm] = useState({ customer_name:'', phone:'', booking_date:'', booking_time:'', people_count:'' })
  const [step,setStep] = useState('map')
  const [admin,setAdmin] = useState(false)
  const [showAdmin,setShowAdmin] = useState(false)
  const [loading,setLoading] = useState(false)
  const [datePanel,setDatePanel] = useState(false)
  const [timePanel,setTimePanel] = useState(false)
  const datePanelRef = useRef(null)
  const timePanelRef = useRef(null)

  useEffect(()=>{
    fetchBookings(); fetchBarTables()
    const t = setInterval(fetchBookings, 15000)
    return ()=>clearInterval(t)
  },[])

  useEffect(()=>{
    const fn = e => {
      if(datePanelRef.current&&!datePanelRef.current.contains(e.target)) setDatePanel(false)
      if(timePanelRef.current&&!timePanelRef.current.contains(e.target)) setTimePanel(false)
    }
    document.addEventListener('mousedown',fn)
    return ()=>document.removeEventListener('mousedown',fn)
  },[])

  useEffect(()=>{
    if(!form.booking_date||!form.booking_time){ setBookedIds(new Set()); return }
    const ids = new Set(
      bookings
        .filter(b=>b.booking_date===form.booking_date&&b.booking_time===form.booking_time&&b.status!=='cancelled')
        .map(b=>{ const bt=barTables.find(t=>t.id===b.table_id); return bt?bt.table_name:null })
        .filter(Boolean)
    )
    setBookedIds(ids)
    if(selected&&ids.has(selected)) setSelected(null)
  },[form.booking_date,form.booking_time,bookings,barTables])

  // Reset pair when time changes (pair avail changes)
  useEffect(()=>{ setPairSelected(false) },[form.booking_date,form.booking_time,selected])

  const fetchBookings = async()=>{
    try{ const r=await fetch(`${API_URL}/api/bookings`); setBookings(await r.json()) } catch{}
  }
  const fetchBarTables = async()=>{
    try{ const r=await fetch(`${API_URL}/api/bar_tables`); setBarTables(await r.json()) } catch{}
  }

  const bookSingleTable = async(tableName)=>{
  const tableRow = barTables.find(t=>t.table_name===tableName)
  if(!tableRow) return { success: false, message: 'ไม่พบโต๊ะ' }
  const r = await fetch(`${API_URL}/api/bookings`,{
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      customer_name:form.customer_name, phone:form.phone,
      table_id:tableRow.id, booking_date:form.booking_date,
      booking_time:form.booking_time,
      people_count:form.people_count?parseInt(form.people_count):2,
    })
  })
  if(!r.ok) return { success: false, message: `Server error ${r.status}` }
  return await r.json()
}

  const handleSubmit = async()=>{
    if(!form.customer_name||!form.phone||!form.booking_date||!form.booking_time||!selected){
      alert('กรุณากรอกข้อมูลให้ครบ'); return
    }
    setLoading(true)
    try{
      const pairId = TABLE_PAIRS[selected]
      const bookPair = pairSelected && pairId && !bookedIds.has(pairId)

      const d1 = await bookSingleTable(selected)
      if(!d1?.success){ alert(d1?.message||'เกิดข้อผิดพลาด'); fetchBookings(); setLoading(false); return }

      if(bookPair){
        await bookSingleTable(pairId)
      }

      alert(`จองสำเร็จ — โต๊ะ ${selected}${bookPair?` + ${pairId}`:''}`)
      fetchBookings(); setSelected(null); setPairSelected(false)
      setForm({customer_name:'',phone:'',booking_date:'',booking_time:'',people_count:''})
      setStep('map')
    } catch{ alert('Server Error') }
    setLoading(false)
  }

  const updateStatus = async(id,status)=>{
    try{
      await fetch(`${API_URL}/api/bookings/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})})
      fetchBookings()
    } catch{}
  }
  const del = async(id)=>{
    if(!confirm('ยืนยันการลบ?')) return
    try{ await fetch(`${API_URL}/api/bookings/${id}`,{method:'DELETE'}); fetchBookings() } catch{}
  }

  const pairTable = selected ? TABLE_PAIRS[selected] : null
  const pairBooked = pairTable ? bookedIds.has(pairTable) : false

  const renderTable = tb=>{
    const booked = bookedIds.has(tb.id)
    const isSel = selected===tb.id
    const isPair = selected && TABLE_PAIRS[selected]===tb.id && pairSelected && !booked
    const isHovState = hov===tb.id && !booked
    const s = ZC[tb.z]
    const fill = booked?s.book:isSel?s.sel:isPair?s.pair:isHovState?s.hov:s.free
    const fs = tb.id.length>3?7:8
    return (
      <g key={tb.id} style={{cursor:booked?'not-allowed':'pointer'}}
        onClick={()=>{ if(!booked) setSelected(p=>p===tb.id?null:tb.id) }}
        onMouseEnter={()=>setHov(tb.id)} onMouseLeave={()=>setHov(null)}>
        <circle cx={tb.x+1} cy={tb.y+1.5} r={R} fill="rgba(0,0,0,0.45)"/>
        <circle cx={tb.x} cy={tb.y} r={R} fill={fill}
          stroke={isSel?'rgba(255,255,255,0.9)':isPair?'rgba(240,160,20,0.7)':booked?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.5)'}
          strokeWidth={isSel?1.8:isPair?1.5:1} style={{transition:'fill 0.12s'}}/>
        <text x={tb.x} y={tb.y-0.5} textAnchor="middle" dominantBaseline="central"
          fill={booked?'rgba(255,255,255,0.18)':'rgba(255,255,255,0.95)'}
          fontSize={fs} fontWeight="700" style={{pointerEvents:'none',userSelect:'none'}}>{tb.id}</text>
        {booked&&<>
          <line x1={tb.x-7} y1={tb.y-7} x2={tb.x+7} y2={tb.y+7} stroke="rgba(255,255,255,0.16)" strokeWidth="1.5"/>
          <line x1={tb.x+7} y1={tb.y-7} x2={tb.x-7} y2={tb.y+7} stroke="rgba(255,255,255,0.16)" strokeWidth="1.5"/>
        </>}
      </g>
    )
  }

  const inp={
    width:'100%',height:46,padding:'0 14px',borderRadius:8,
    border:'1px solid rgba(255,255,255,0.09)',background:'rgba(255,255,255,0.04)',
    color:'#fff',fontSize:14,fontFamily:'inherit',boxSizing:'border-box',
    outline:'none',transition:'border 0.18s, background 0.18s',
  }

  const dd = form.booking_date ? {
    day:parseInt(form.booking_date.split('-')[2]),
    dow:getDayName(form.booking_date)
  } : null

  return (
    <div style={{
      minHeight:'100vh',display:'flex',flexDirection:'column',
      background:'#060101',color:'#fff',
      fontFamily:'"Inter","Sarabun","Kanit",system-ui,sans-serif',
    }}>

      {/* ── TOPBAR ── */}
      <header style={{
        height:52,flexShrink:0,display:'flex',alignItems:'center',
        justifyContent:'space-between',padding:'0 18px',
        background:'rgba(4,0,0,0.98)',borderBottom:'1px solid rgba(255,255,255,0.05)',
        position:'sticky',top:0,zIndex:300,
      }}>
        <div>
          <div style={{fontSize:14,fontWeight:800,letterSpacing:3,color:'#d4980a',lineHeight:1.2}}>DUEM BAR</div>
          <div style={{fontSize:7.5,letterSpacing:2.5,color:'rgba(255,255,255,0.18)',fontWeight:500}}>TABLE RESERVATION</div>
        </div>
        {/* hidden admin button — จุดเล็กๆ มุมขวา */}
        <button
          onClick={()=>{ if(admin){ setStep('list') } else setShowAdmin(true) }}
          title="Staff"
          style={{
            width:28,height:28,borderRadius:6,border:'none',cursor:'pointer',
            background:'rgba(255,255,255,0.04)',
            display:'flex',alignItems:'center',justifyContent:'center',
            opacity:0.35,transition:'opacity 0.2s',
          }}
          onMouseEnter={e=>e.currentTarget.style.opacity='0.8'}
          onMouseLeave={e=>e.currentTarget.style.opacity='0.35'}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2"/>
            <path d="M4.5 6V4a2.5 2.5 0 015 0v2" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </button>
      </header>

      {/* ── ADMIN POPUP ── */}
      {showAdmin && (
        <AdminPopup
          onSuccess={()=>{ setAdmin(true); setShowAdmin(false); setStep('list') }}
          onClose={()=>setShowAdmin(false)}
        />
      )}

      {/* ── MAP VIEW ── */}
      {step==='map'&&(
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          {/* Filter bar */}
          <div style={{
            flexShrink:0,padding:'8px 14px',display:'flex',gap:8,alignItems:'center',
            background:'rgba(0,0,0,0.5)',borderBottom:'1px solid rgba(255,255,255,0.04)',zIndex:100,
          }}>
            {/* DATE */}
            <div ref={datePanelRef} style={{position:'relative',flex:1}}>
              <button onClick={()=>{ setDatePanel(p=>!p); setTimePanel(false) }} style={{
                width:'100%',height:40,borderRadius:7,border:'none',cursor:'pointer',fontFamily:'inherit',
                background:form.booking_date?'rgba(192,57,43,0.18)':'rgba(255,255,255,0.04)',
                outline:`1px solid ${form.booking_date?'rgba(192,57,43,0.55)':datePanel?'rgba(192,57,43,0.4)':'rgba(255,255,255,0.08)'}`,
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:1,transition:'all 0.15s',
              }}>
                {dd
                  ? <><span style={{fontSize:19,fontWeight:800,color:'#f0a020',lineHeight:1}}>{dd.day}</span>
                      <span style={{fontSize:8,color:'rgba(255,255,255,0.4)',fontWeight:600,letterSpacing:1}}>{dd.dow}</span></>
                  : <><span style={{fontSize:11,color:'rgba(255,255,255,0.22)',fontWeight:600}}>วันที่</span>
                      <span style={{fontSize:8,color:'rgba(255,255,255,0.14)'}}>เลือกวันที่</span></>}
              </button>
              {datePanel&&(
                <div style={{position:'absolute',top:'calc(100% + 6px)',left:0,zIndex:500}}>
                  <CalendarPicker date={form.booking_date}
                    onDate={v=>{
                      const times = getTimesForDate(v)
                      const newTime = form.booking_time&&times.includes(form.booking_time)?form.booking_time:''
                      setForm({...form,booking_date:v,booking_time:newTime})
                    }}
                    onClose={()=>setDatePanel(false)}/>
                </div>
              )}
            </div>
            {/* TIME */}
            <div ref={timePanelRef} style={{position:'relative',flex:1}}>
              <button onClick={()=>{ setTimePanel(p=>!p); setDatePanel(false) }} style={{
                width:'100%',height:40,borderRadius:7,border:'none',cursor:'pointer',fontFamily:'inherit',
                background:form.booking_time?'rgba(192,57,43,0.18)':'rgba(255,255,255,0.04)',
                outline:`1px solid ${form.booking_time?'rgba(192,57,43,0.55)':timePanel?'rgba(192,57,43,0.4)':'rgba(255,255,255,0.08)'}`,
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:1,transition:'all 0.15s',
              }}>
                {form.booking_time
                  ? <><span style={{fontSize:19,fontWeight:800,color:'#f0a020',lineHeight:1}}>{form.booking_time}</span>
                      <span style={{fontSize:8,color:'rgba(255,255,255,0.4)',fontWeight:600,letterSpacing:1}}>น.</span></>
                  : <><span style={{fontSize:11,color:'rgba(255,255,255,0.22)',fontWeight:600}}>เวลา</span>
                      <span style={{fontSize:8,color:'rgba(255,255,255,0.14)'}}>19:00–22:30</span></>}
              </button>
              {timePanel&&(
                <div style={{position:'absolute',top:'calc(100% + 6px)',right:0,zIndex:500}}>
                  <TimePicker time={form.booking_time} dateStr={form.booking_date}
                    onTime={v=>setForm({...form,booking_time:v})}
                    onClose={()=>setTimePanel(false)}/>
                </div>
              )}
            </div>
            {/* Legend */}
            <div style={{display:'flex',gap:8,paddingLeft:4,flexShrink:0}}>
              {[['#c0392b','ว่าง'],['#d4890a','เลือก'],['#2a0808','จอง']].map(([c,l])=>(
                <span key={l} style={{display:'flex',alignItems:'center',gap:4,fontSize:9,color:'rgba(255,255,255,0.25)',whiteSpace:'nowrap'}}>
                  <span style={{width:7,height:7,borderRadius:'50%',background:c,display:'inline-block'}}/>
                  {l}
                </span>
              ))}
            </div>
          </div>

          {/* Map */}
          <div style={{flex:1,overflow:'auto',background:'#1a1008'}}>
            <div style={{display:'inline-block',padding:14}}>
              <svg width="650" height="600" style={{display:'block'}}>
                <defs>
                  <pattern id="wood" x="0" y="0" width="48" height="9" patternUnits="userSpaceOnUse">
                    <rect width="48" height="9" fill="#2a1e10"/>
                    <rect width="48" height="0.7" y="8.3" fill="#1e1408" opacity="0.7"/>
                    <rect width="0.6" height="9" x="24" fill="#1e1408" opacity="0.25"/>
                  </pattern>
                  <pattern id="tile" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
                    <rect width="18" height="18" fill="#1e160a"/>
                    <rect width="8" height="8" x="0.5" y="0.5" fill="#261c0c" rx="0.5"/>
                    <rect width="8" height="8" x="9.5" y="9.5" fill="#261c0c" rx="0.5"/>
                  </pattern>
                  <pattern id="cfloor" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                    <rect width="28" height="30" fill="#141008"/>
                    <rect width="26" height="26" x="1" y="1" fill="none" stroke="#1e160a" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="650" height="616" fill="url(#wood)"/>
                <rect x="36" y="330" width="380" height="130" fill="url(#tile)"/>
                <rect x="36" y="470" width="290" height="76" fill="url(#cfloor)"/>
                <line x1="36" y1="330" x2="420" y2="330" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4,4"/>
                <line x1="36" y1="470" x2="330" y2="470" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4,4"/>
                <text x="36" y="200" fontSize="8" fontWeight="700" fill="rgba(255,255,255,0.1)" letterSpacing="2" transform="rotate(-90 36 210)">ZONE A</text>
                <text x="36" y="410" fontSize="8" fontWeight="700" fill="rgba(255,255,255,0.1)" letterSpacing="2" transform="rotate(-90 36 420)">ZONE B</text>
                <text x="70" y="552" fontSize="8" fontWeight="700" fill="rgba(255,255,255,0.1)" letterSpacing="2" transform="rotate(-90 36 562)">ZONE C</text>
                <text x="550" y="260" textAnchor="middle" fontSize="8" fontWeight="700" fill="rgba(255,255,255,0.1)" letterSpacing="2">ZONE D</text>
                <rect x="160" y="14" width="275" height="60" rx="4" fill="#3a2c04" stroke="#4e3e08" strokeWidth="1"/>
                <rect x="162" y="16" width="271" height="56" rx="3" fill="none" stroke="rgba(255,200,40,0.12)" strokeWidth="0.8"/>
                <text x="297" y="48" textAnchor="middle" fill="rgba(255,235,150,0.75)" fontSize="13" fontWeight="700" letterSpacing="5" style={{pointerEvents:'none'}}>STAGE</text>
                <rect x="6" y="48" width="98" height="98" rx="4" fill="#160c04" stroke="#281608" strokeWidth="1.5"/>
                {[0,9,18,27,36,45,54,63,72,81,90].map(dy=>(
                  <line key={dy} x1="8" y1={50+dy} x2="102" y2={50+dy} stroke="#1e1006" strokeWidth="0.65" opacity="0.7"/>
                ))}
                <rect x="6" y="48" width="98" height="8" rx="3" fill="#3a1e08" stroke="#281608" strokeWidth="1"/>
                <text x="55" y="103" textAnchor="middle" fill="#8a6028" fontSize="10" fontWeight="700" letterSpacing="4" style={{pointerEvents:'none'}}>BAR</text>
                <rect x="6" y="8" width="40" height="32" rx="3" fill="#0e0820" stroke="#0c0618" strokeWidth="1"/>
                <text x="26" y="18" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7" fontWeight="600" letterSpacing="1">W.C</text>
                <text x="26" y="33" textAnchor="middle" fill="rgba(140,140,220,0.55)" fontSize="13">♂</text>
                <rect x="50" y="8" width="40" height="32" rx="3" fill="#200810" stroke="#180610" strokeWidth="1"/>
                <text x="70" y="18" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7" fontWeight="600" letterSpacing="1">W.C</text>
                <text x="70" y="33" textAnchor="middle" fill="rgba(220,140,150,0.55)" fontSize="13">♀</text>
                <rect x="112" y="16" width="38" height="54" rx="2" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                <text x="131" y="46" textAnchor="middle" fill="rgba(255,255,255,0.18)" fontSize="6.5" letterSpacing="0.5">ประตู</text>
                <rect x="602" y="14" width="42" height="205" rx="3" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" strokeDasharray="4,4"/>
                <text x="580" y="65" textAnchor="middle" fill="rgba(255,255,255,0.1)" fontSize="6.5" fontWeight="600" letterSpacing="1.5" transform="rotate(-90 623 65)">COMING SOON</text>
                <rect x="602" y="232" width="42" height="30" rx="3" fill="#0e0820" stroke="#0c0618" strokeWidth="1"/>
                <text x="623" y="251" textAnchor="middle" fill="rgba(140,140,220,0.55)" fontSize="14">♂</text>
                <rect x="602" y="268" width="42" height="30" rx="3" fill="#200810" stroke="#180610" strokeWidth="1"/>
                <text x="623" y="287" textAnchor="middle" fill="rgba(220,140,150,0.55)" fontSize="14">♀</text>
                <rect x="602" y="312" width="42" height="50" rx="3" fill="#200c04" stroke="#301408" strokeWidth="1" strokeDasharray="3,3"/>
                <text x="623" y="340" textAnchor="middle" fill="rgba(255,170,100,0.6)" fontSize="8.5" fontWeight="600" letterSpacing="0.8">ครัว</text>
                {[[225,360],[540,130]].map(([cx,cy],i)=>(
                  <g key={i}>
                    <ellipse cx={cx} cy={cy+20} rx={14} ry={8} fill="#0e0c04" opacity="0.8"/>
                    <circle cx={cx-9} cy={cy+4} r={12} fill="#0e3818" opacity="0.9"/>
                    <circle cx={cx+9} cy={cy+4} r={12} fill="#124820" opacity="0.9"/>
                    <circle cx={cx} cy={cy-6} r={14} fill="#0a2e14" opacity="0.95"/>
                    <circle cx={cx} cy={cy-6} r={6} fill="#1a6030" opacity="0.4"/>
                  </g>
                ))}
                {[[226,235],[290,215],[385,215],[139,235],[320,255]].map(([cx,cy],i)=>(
                  <g key={`p-${i}`}>
                    <rect x={cx-7} y={cy-7} width="7" height="7" fill="none" stroke="#000" strokeWidth="1.5"/>
                  </g>
                ))}
                {TABLES.map(renderTable)}
              </svg>
            </div>
          </div>

          {/* Bottom sheet เมื่อเลือกโต๊ะ */}
          {selected&&(
            <BottomSheet
              selected={selected}
              pairTable={!pairBooked ? pairTable : null}
              form={form}
              onProceed={()=>setStep('form')}
              onDeselect={()=>{ setSelected(null); setPairSelected(false) }}
              onPairToggle={()=>setPairSelected(p=>!p)}
              isPairSelected={pairSelected}
            />
          )}
        </div>
      )}

      {/* ── FORM VIEW ── */}
      {step==='form'&&(
        <div style={{flex:1,overflow:'auto',display:'flex',flexDirection:'column',alignItems:'center',padding:'24px 16px 40px'}}>
          <div style={{width:'100%',maxWidth:420}}>
            <button onClick={()=>setStep('map')} style={{
              background:'none',border:'none',color:'rgba(255,255,255,0.25)',fontSize:11,
              cursor:'pointer',fontFamily:'inherit',padding:0,marginBottom:20,
              display:'flex',alignItems:'center',gap:5,fontWeight:500,
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              กลับแผนผัง
            </button>

            {/* Summary */}
            {selected&&(
  <div style={{
    padding:'14px 16px',
    background:'rgba(184,50,40,0.08)',border:'1px solid rgba(184,50,40,0.2)',
    borderRadius:10,marginBottom:20,
    display:'flex',alignItems:'flex-start',gap:14,
  }}>
    {/* Badge โต๊ะ */}
    <div style={{
      flexShrink:0,minWidth:52,padding:'6px 10px',borderRadius:8,
      background:'rgba(184,50,40,0.16)',border:'1px solid rgba(184,50,40,0.35)',
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:1,
    }}>
      <span style={{fontSize:6,color:'rgba(255,255,255,0.25)',fontWeight:700,letterSpacing:1}}>TABLE</span>
      <span style={{fontSize:18,fontWeight:800,color:'#f0a020',lineHeight:1.15}}>{selected}</span>
      {pairSelected&&pairTable&&(
        <>
          <span style={{fontSize:11,color:'rgba(255,255,255,0.3)',lineHeight:1}}>+</span>
          <span style={{fontSize:18,fontWeight:800,color:'#f0a020',lineHeight:1.15}}>{pairTable}</span>
        </>
      )}
    </div>
    {/* Info */}
    <div style={{flex:1}}>
      <div style={{fontSize:8,color:'rgba(255,255,255,0.2)',fontWeight:700,letterSpacing:2,marginBottom:6}}>RESERVATION</div>
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
        
        <span style={{fontSize:13,color:'rgba(255,255,255,0.75)',fontWeight:600}}>
          {form.booking_date ? `${form.booking_date.split('-')[2]} ${MONTH_TH[parseInt(form.booking_date.split('-')[1])-1]} ${form.booking_date.split('-')[0]}` : '—'}
        </span>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:pairSelected&&pairTable?8:0}}>
        
        <span style={{fontSize:13,color:'rgba(255,255,255,0.75)',fontWeight:600}}>{form.booking_time||'—'}</span>
      </div>
      {pairSelected&&pairTable&&(
        <div style={{
          display:'inline-flex',alignItems:'center',gap:5,
          background:'rgba(212,137,10,0.12)',border:'1px solid rgba(212,137,10,0.3)',
          borderRadius:5,padding:'3px 8px',
        }}>
          <span style={{fontSize:9,color:'#d4890a',fontWeight:700}}>ต่อโต๊ะ {pairTable}</span>
        </div>
      )}
    </div>
  </div>
)}

            {/* Date/Time picker ถ้ายังไม่ได้เลือก */}
            {(!form.booking_date||!form.booking_time)&&(
              <div style={{marginBottom:16,display:'flex',gap:8}}>
                <div ref={datePanelRef} style={{position:'relative',flex:1}}>
                  <button onClick={()=>{setDatePanel(p=>!p);setTimePanel(false)}} style={{
                    width:'100%',height:46,borderRadius:8,border:'none',cursor:'pointer',fontFamily:'inherit',
                    background:form.booking_date?'rgba(192,57,43,0.18)':'rgba(255,255,255,0.04)',
                    outline:`1px solid ${form.booking_date?'rgba(192,57,43,0.55)':'rgba(255,255,255,0.09)'}`,
                    display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:1,
                  }}>
                    {dd
                      ? <><span style={{fontSize:17,fontWeight:800,color:'#f0a020',lineHeight:1}}>{dd.day}</span>
                          <span style={{fontSize:8,color:'rgba(255,255,255,0.4)',letterSpacing:1}}>{dd.dow}</span></>
                      : <span style={{fontSize:12,color:'rgba(255,255,255,0.25)'}}>เลือกวันที่</span>}
                  </button>
                  {datePanel&&(
                    <div style={{position:'absolute',top:'calc(100% + 6px)',left:0,zIndex:500}}>
                      <CalendarPicker date={form.booking_date}
                        onDate={v=>{ const times=getTimesForDate(v); const nt=form.booking_time&&times.includes(form.booking_time)?form.booking_time:''; setForm({...form,booking_date:v,booking_time:nt}) }}
                        onClose={()=>setDatePanel(false)}/>
                    </div>
                  )}
                </div>
                <div ref={timePanelRef} style={{position:'relative',flex:1}}>
                  <button onClick={()=>{setTimePanel(p=>!p);setDatePanel(false)}} style={{
                    width:'100%',height:46,borderRadius:8,border:'none',cursor:'pointer',fontFamily:'inherit',
                    background:form.booking_time?'rgba(192,57,43,0.18)':'rgba(255,255,255,0.04)',
                    outline:`1px solid ${form.booking_time?'rgba(192,57,43,0.55)':'rgba(255,255,255,0.09)'}`,
                    display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:1,
                  }}>
                    {form.booking_time
                      ? <><span style={{fontSize:17,fontWeight:800,color:'#f0a020',lineHeight:1}}>{form.booking_time}</span>
                          <span style={{fontSize:8,color:'rgba(255,255,255,0.4)',letterSpacing:1}}>น.</span></>
                      : <span style={{fontSize:12,color:'rgba(255,255,255,0.25)'}}>เลือกเวลา</span>}
                  </button>
                  {timePanel&&(
                    <div style={{position:'absolute',top:'calc(100% + 6px)',right:0,zIndex:500}}>
                      <TimePicker time={form.booking_time} dateStr={form.booking_date}
                        onTime={v=>setForm({...form,booking_time:v})}
                        onClose={()=>setTimePanel(false)}/>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {[
                {k:'customer_name',ph:'ชื่อ-นามสกุล',t:'text'},
                {k:'phone',ph:'เบอร์โทรศัพท์',t:'tel'},
                {k:'people_count',ph:'จำนวนคน',t:'number'},
              ].map(({k,ph,t})=>(
                <input key={k} style={inp} type={t} placeholder={ph}
                  value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}
                  min={t==='number'?1:undefined} max={t==='number'?20:undefined}
                  onFocus={e=>{e.target.style.border='1px solid rgba(184,50,40,0.55)';e.target.style.background='rgba(184,50,40,0.07)'}}
                  onBlur={e=>{e.target.style.border='1px solid rgba(255,255,255,0.09)';e.target.style.background='rgba(255,255,255,0.04)'}}/>
              ))}
            </div>

            <button onClick={handleSubmit} disabled={loading||!selected} style={{
              width:'100%',height:46,borderRadius:8,border:'none',marginTop:18,
              background:loading||!selected?'rgba(100,25,20,0.35)':'#b83228',
              color:'#fff',fontSize:14,fontWeight:700,
              cursor:loading||!selected?'not-allowed':'pointer',
              fontFamily:'inherit',letterSpacing:1,
              boxShadow:loading||!selected?'none':'0 4px 20px rgba(184,50,40,0.42)',
              transition:'all 0.2s',
            }}>{loading?'กำลังจอง...':'ยืนยันการจอง'}</button>
            {/* หมายเหตุ */}
<div
  style={{
    marginTop: 22,
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: '16px 18px',
  }}
>
  {/* HEADER */}
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    }}
  >
    {/* ICON */}
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255,255,255,0.55)',
        fontSize: 13,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      i
    </div>

    <span
      style={{
        color: '#d94c3d',
        fontSize: 16,
        fontWeight: 700,
      }}
    >
      หมายเหตุ
    </span>
  </div>

  {/* LIST */}
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      paddingLeft: 6,
    }}
  >
    {[
      'กรุณามาถึงก่อนเวลาอย่างน้อย 15 นาที',
      'หากไม่มาตามเวลาที่จองไว้ การจองอาจถูกยกเลิกอัตโนมัติ',
      'กรุณาแคปหน้าจอการจองไว้เป็นหลักฐาน',
    ].map((txt, i) => (
      <div
        key={i}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
        }}
      >
        <span
          style={{
            color: 'rgba(255,255,255,0.4)',
            marginTop: 2,
            fontSize: 10,
          }}
        >
          ●
        </span>

        <span
          style={{
            color: 'rgba(255,255,255,0.58)',
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          {txt}
        </span>
      </div>
    ))}
  </div>
</div>
          </div>
        </div>
      )}
    
      {/* ── LIST VIEW (admin only) ── */}
      {step==='list'&&(
        <div style={{flex:1,overflow:'auto',padding:'20px 16px'}}>
          <div style={{maxWidth:520,margin:'0 auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div style={{fontSize:8,letterSpacing:3,color:'rgba(255,255,255,0.15)',fontWeight:700}}>BOOKING LIST</div>
              <div style={{display:'flex',gap:10,alignItems:'center'}}>
                <span style={{fontSize:10,color:'rgba(255,255,255,0.2)'}}>
                  {bookings.filter(b=>b.status!=='cancelled').length} รายการ
                </span>
                <button onClick={()=>setStep('map')} style={{
                  padding:'4px 10px',borderRadius:5,border:'1px solid rgba(255,255,255,0.08)',
                  background:'transparent',color:'rgba(255,255,255,0.3)',fontSize:10,
                  cursor:'pointer',fontFamily:'inherit',
                }}>← แผนผัง</button>
              </div>
            </div>
            {bookings.length===0&&(
              <div style={{color:'rgba(255,255,255,0.1)',textAlign:'center',padding:'80px 0',fontSize:11,letterSpacing:2}}>NO RESERVATIONS</div>
            )}
            {bookings.map(b=>{
              const SC={confirmed:'#27ae60',cancelled:'#e74c3c',pending:'#e8a000'}
              const SL={confirmed:'Confirmed',cancelled:'Cancelled',pending:'Pending'}
              const sc=SC[b.status]||'#e8a000'
              return (
                <div key={b.id} style={{
                  background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.06)',
                  borderLeft:`2px solid ${sc}`,borderRadius:8,padding:'13px 14px',marginBottom:7,
                }}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:14,color:'rgba(255,255,255,0.88)'}}>{b.customer_name}</div>
                      <div style={{color:'rgba(255,255,255,0.25)',fontSize:11,marginTop:2}}>{b.phone}</div>
                    </div>
                    <span style={{
                      fontSize:8.5,fontWeight:700,letterSpacing:0.8,padding:'3px 10px',
                      borderRadius:20,background:sc+'18',color:sc,border:`1px solid ${sc}28`,
                    }}>{SL[b.status]}</span>
                  </div>
                  <div style={{display:'flex',gap:10,flexWrap:'wrap',fontSize:11,color:'rgba(255,255,255,0.35)',marginBottom:11}}>
                    <span style={{
                      color:'rgba(255,255,255,0.65)',fontWeight:700,
                      background:'rgba(255,255,255,0.05)',padding:'2px 8px',borderRadius:4,
                    }}>{b.bar_tables?.table_name||b.table_id}</span>
                    <span>{b.booking_date}</span>
                    <span>{b.booking_time}</span>
                    {b.people_count&&<span>{b.people_count} คน</span>}
                  </div>
                  <div style={{display:'flex',gap:5}}>
                    {[['Confirm','#27ae60','confirmed'],['Cancel','#e8a000','cancelled'],['Delete','#e74c3c',null]].map(([l,c,s])=>(
                      <button key={l} onClick={()=>s?updateStatus(b.id,s):del(b.id)} style={{
                        padding:'4px 12px',borderRadius:5,border:`1px solid ${c}22`,
                        background:`${c}0a`,color:c,cursor:'pointer',fontFamily:'inherit',
                        fontSize:10,fontWeight:600,letterSpacing:0.5,transition:'background 0.12s',
                      }}
                        onMouseEnter={e=>e.currentTarget.style.background=c+'22'}
                        onMouseLeave={e=>e.currentTarget.style.background=c+'0a'}
                      >{l}</button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}