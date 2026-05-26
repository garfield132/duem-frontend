import { useEffect, useState, useRef } from 'react'
const API_URL = import.meta.env.VITE_API_URL

const DATES = ['2026-05-20','2026-05-21','2026-05-22','2026-05-23','2026-05-24']
const TIMES = ['19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30']
const DAY_TH = {'2026-05-20':'พุธ','2026-05-21':'พฤหัส','2026-05-22':'ศุกร์','2026-05-23':'เสาร์','2026-05-24':'อาทิตย์'}
const DAY_NUM = {'2026-05-20':'20','2026-05-21':'21','2026-05-22':'22','2026-05-23':'23','2026-05-24':'24'}

const R = 12
const mk = (id, x, y, z) => ({ id, x, y, z })


const TABLES = [
  mk('A1',  55, 172, 'A'), mk('A2',  55, 202, 'A'), mk('A3',  55, 245, 'A'),
  mk('A4',  55, 275, 'A'), mk('A5',  55, 305, 'A'),
  mk('A6',  85, 172, 'A'), mk('A7',  85, 202, 'A'),
  mk('A8',  115, 172, 'A'), mk('A9',  115, 202, 'A'),
  mk('A10', 115, 232, 'A'), mk('A11', 155, 232, 'A'),
  mk('A12', 136, 275, 'A'), mk('A13', 136, 305, 'A'),
  mk('A14', 180, 285, 'A'), mk('A15', 180, 315, 'A'),
  mk('A16', 195, 110, 'A'), mk('A17', 195, 140, 'A'),
  mk('A18', 175, 180, 'A'), mk('A19', 215, 180, 'A'),
  mk('A20', 200, 230, 'A'), mk('A21', 240, 230, 'A'),
  mk('A22', 222, 285, 'A'), mk('A23', 222, 315, 'A'),
  mk('A24', 265, 130, 'A'), mk('A25', 265, 180, 'A'),
  mk('A26', 280, 230, 'A'), mk('A27', 305, 230, 'A'),
  mk('A28', 268, 285, 'A'), mk('A29', 268, 315, 'A'),
  mk('A30', 305, 130, 'A'), mk('A31', 305, 180, 'A'),
  mk('A32', 325, 275, 'A'), mk('A33', 325, 305, 'A'),
  mk('A34', 350, 130, 'A'), mk('A35', 350, 180, 'A'),
  mk('A36', 354, 230, 'A'), mk('A37', 380, 230, 'A'),
  mk('A38', 370, 285, 'A'), mk('A39', 370, 315, 'A'),
  mk('A40', 390, 130, 'A'), mk('A41', 390, 180, 'A'),
  mk('A42', 415, 230, 'A'), mk('A43', 440, 230, 'A'),
  mk('A44', 415, 275, 'A'), mk('A45', 435, 300, 'A'),
  mk('A46', 445, 265, 'A'), mk('A47', 440, 130, 'A'),
  mk('A48', 440, 180, 'A'),
  mk('D1',  510, 180, 'D'), mk('D2',  510, 230, 'D'),
  mk('D3',  540, 180, 'D'), mk('D4',  540, 230, 'D'),
  mk('D5',  570, 180, 'D'), mk('D6',  570, 230, 'D'),
  mk('B1',  55, 348, 'B'),  mk('B2',  55, 378, 'B'),
  mk('B3',  55, 408, 'B'),  mk('B4',  55, 438, 'B'),
  mk('B5',  100, 348, 'B'), mk('B6',  100, 378, 'B'),
  mk('B7',  100, 408, 'B'), mk('B8',  100, 438, 'B'),
  mk('B9',  150, 348, 'B'), mk('B10', 150, 378, 'B'),
  mk('B11', 150, 408, 'B'), mk('B12', 150, 438, 'B'),
  mk('B13', 200, 408, 'B'), mk('B14', 200, 438, 'B'),
  mk('B15', 250, 408, 'B'), mk('B16', 250, 438, 'B'),
  mk('B17', 310, 348, 'B'), mk('B18', 310, 378, 'B'),
  mk('B19', 350, 378, 'B'), mk('B20', 326, 406, 'B'),
  mk('B21', 305, 438, 'B'), mk('B22', 385, 378, 'B'),
  mk('B23', 365, 406, 'B'), mk('B24', 345, 438, 'B'),
  mk('C1',  55, 485, 'C'),  mk('C2',  55, 525, 'C'),
  mk('C3',  120, 485, 'C'), mk('C4',  120, 525, 'C'),
  mk('C5',  185, 485, 'C'), mk('C6',  185, 525, 'C'),
  mk('C7',  245, 485, 'C'), mk('C8',  245, 525, 'C'),
  mk('C9',  305, 485, 'C'), mk('C10', 305, 525, 'C'),
]

const ZC = {
  A: { free:'#c0392b', book:'#2a0808', sel:'#d4890a', hov:'#e04535' },
  B: { free:'#922b21', book:'#200606', sel:'#b07208', hov:'#b03528' },
  C: { free:'#6e1c14', book:'#180404', sel:'#905a08', hov:'#882218' },
  D: { free:'#8b4513', book:'#241208', sel:'#a06010', hov:'#a85520' },
}

function Picker({ date, time, onDate, onTime }) {
  const [panel, setPanel] = useState(null)
  const ref = useRef(null)
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setPanel(null) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])
  const toggle = p => setPanel(v => v === p ? null : p)
  return (
    <div ref={ref} style={{ position:'relative', display:'flex', gap:6, flex:1 }}>
      <button onClick={() => toggle('date')} style={{
        flex:1, height:40, borderRadius:7, border:'none', cursor:'pointer', fontFamily:'inherit',
        background: date ? 'rgba(192,57,43,0.18)' : 'rgba(255,255,255,0.04)',
        outline: `1px solid ${date ? 'rgba(192,57,43,0.55)' : panel==='date' ? 'rgba(192,57,43,0.55)' : 'rgba(255,255,255,0.08)'}`,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:1, transition:'all 0.15s',
      }}>
        {date
          ? <><span style={{ fontSize:20, fontWeight:800, color:'#f0a020', lineHeight:1 }}>{DAY_NUM[date]}</span>
              <span style={{ fontSize:8, color:'rgba(255,255,255,0.4)', fontWeight:600, letterSpacing:1.5 }}>{DAY_TH[date]}</span></>
          : <><span style={{ fontSize:11, color:'rgba(255,255,255,0.22)', fontWeight:600, letterSpacing:0.8 }}>วันที่</span>
              <span style={{ fontSize:8, color:'rgba(255,255,255,0.14)' }}>พ.ค. 2026</span></>}
      </button>
      <button onClick={() => toggle('time')} style={{
        flex:1, height:40, borderRadius:7, border:'none', cursor:'pointer', fontFamily:'inherit',
        background: time ? 'rgba(192,57,43,0.18)' : 'rgba(255,255,255,0.04)',
        outline: `1px solid ${time ? 'rgba(192,57,43,0.55)' : panel==='time' ? 'rgba(192,57,43,0.55)' : 'rgba(255,255,255,0.08)'}`,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:1, transition:'all 0.15s',
      }}>
        {time
          ? <><span style={{ fontSize:20, fontWeight:800, color:'#f0a020', lineHeight:1 }}>{time}</span>
              <span style={{ fontSize:8, color:'rgba(255,255,255,0.4)', fontWeight:600, letterSpacing:1 }}>น.</span></>
          : <><span style={{ fontSize:11, color:'rgba(255,255,255,0.22)', fontWeight:600, letterSpacing:0.8 }}>เวลา</span>
              <span style={{ fontSize:8, color:'rgba(255,255,255,0.14)' }}>19:00–22:30</span></>}
      </button>
      {panel==='date' && (
        <div style={{
          position:'absolute', top:'calc(100% + 6px)', left:0, width:240, zIndex:500,
          background:'#0d0101', border:'1px solid rgba(192,57,43,0.4)', borderRadius:8,
          padding:10, boxShadow:'0 20px 50px rgba(0,0,0,0.9)',
        }}>
          <div style={{ fontSize:8, letterSpacing:2.5, color:'rgba(255,255,255,0.2)', fontWeight:700, marginBottom:8 }}>SELECT DATE</div>
          {DATES.map(d => (
            <button key={d} onClick={() => { onDate(d); setPanel(null) }} style={{
              width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'7px 10px', borderRadius:5, border:'none', cursor:'pointer', fontFamily:'inherit',
              background: date===d ? 'rgba(192,57,43,0.22)' : 'transparent',
              outline: date===d ? '1px solid rgba(192,57,43,0.5)' : '1px solid transparent',
              marginBottom:3, transition:'background 0.1s', color:'inherit',
            }}
              onMouseEnter={e => { if(date!==d) e.currentTarget.style.background='rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { e.currentTarget.style.background = date===d?'rgba(192,57,43,0.22)':'transparent' }}
            >
              <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
                <span style={{ fontSize:22, fontWeight:800, color:date===d?'#f0a020':'rgba(255,255,255,0.82)', lineHeight:1, minWidth:26 }}>{DAY_NUM[d]}</span>
                <span style={{ fontSize:11, color:date===d?'#f0a020':'rgba(255,255,255,0.38)', fontWeight:500 }}>{DAY_TH[d]}</span>
              </div>
              <span style={{ fontSize:9, color:'rgba(255,255,255,0.18)' }}>พ.ค. 2026</span>
            </button>
          ))}
        </div>
      )}
      {panel==='time' && (
        <div style={{
          position:'absolute', top:'calc(100% + 6px)', right:0, width:200, zIndex:500,
          background:'#0d0101', border:'1px solid rgba(192,57,43,0.4)', borderRadius:8,
          padding:10, boxShadow:'0 20px 50px rgba(0,0,0,0.9)',
        }}>
          <div style={{ fontSize:8, letterSpacing:2.5, color:'rgba(255,255,255,0.2)', fontWeight:700, marginBottom:8 }}>SELECT TIME</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
            {TIMES.map(tm => (
              <button key={tm} onClick={() => { onTime(tm); setPanel(null) }} style={{
                padding:'9px 0', borderRadius:5, border:'none', cursor:'pointer', fontFamily:'inherit',
                background: time===tm ? 'rgba(192,57,43,0.22)' : 'rgba(255,255,255,0.03)',
                outline: time===tm ? '1px solid rgba(192,57,43,0.5)' : '1px solid rgba(255,255,255,0.05)',
                color: time===tm ? '#f0a020' : 'rgba(255,255,255,0.62)',
                fontSize:13, fontWeight: time===tm?800:400, letterSpacing:0.5, transition:'all 0.1s',
              }}
                onMouseEnter={e => { if(time!==tm) e.currentTarget.style.background='rgba(255,255,255,0.07)' }}
                onMouseLeave={e => { e.currentTarget.style.background = time===tm?'rgba(192,57,43,0.22)':'rgba(255,255,255,0.03)' }}
              >{tm}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [bookings, setBookings] = useState([])
  const [barTables, setBarTables] = useState([])
  const [bookedIds, setBookedIds] = useState(new Set())
  const [selected, setSelected] = useState(null)
  const [hov, setHov] = useState(null)
  const [form, setForm] = useState({ customer_name:'', phone:'', booking_date:'', booking_time:'', people_count:'' })
  const [step, setStep] = useState('map')
  const [admin, setAdmin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

useEffect(() => {

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768)
  }

  window.addEventListener('resize', handleResize)

  return () => window.removeEventListener('resize', handleResize)

}, [])

  useEffect(() => {
    fetchBookings()
    fetchBarTables()
  }, [])

  useEffect(() => {
    if (!form.booking_date || !form.booking_time) { setBookedIds(new Set()); return }
    const ids = new Set(
      bookings
        .filter(b => b.booking_date===form.booking_date && b.booking_time===form.booking_time && b.status!=='cancelled')
        .map(b => {
          // map int table_id กลับเป็น table_name เพื่อเช็คกับ selected
          const bt = barTables.find(t => t.id === b.table_id)
          return bt ? bt.table_name : null
        })
        .filter(Boolean)
    )
    setBookedIds(ids)
    if (selected && ids.has(selected)) setSelected(null)
  }, [form.booking_date, form.booking_time, bookings, barTables])

  const fetchBookings = async () => {
    try {
      const r = await fetch(`${API_URL}/api/bookings`)
      setBookings(await r.json())
    } catch {}
  }

  const fetchBarTables = async () => {
    try {
      const r = await fetch(`${API_URL}/api/bar_tables`)
      setBarTables(await r.json())
    } catch {}
  }

  const handleSubmit = async () => {
    if (!form.customer_name || !form.phone || !form.booking_date || !form.booking_time || !selected) {
      alert('กรุณากรอกข้อมูลให้ครบ')
      return
    }

    // หา int id จาก bar_tables โดย match table_name
    const tableRow = barTables.find(t => t.table_name === selected)
    if (!tableRow) {
      alert('ไม่พบโต๊ะในระบบ กรุณาติดต่อเจ้าหน้าที่')
      return
    }

    setLoading(true)
    try {
      const r = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.customer_name,
          phone: form.phone,
          table_id: tableRow.id,
          booking_date: form.booking_date,
          booking_time: form.booking_time,
          people_count: form.people_count ? parseInt(form.people_count) : 2,
        })
      })
      const d = await r.json()
      if (d.success) {
        alert(`จองสำเร็จ — โต๊ะ ${selected}`)
        fetchBookings()
        setSelected(null)
        setForm({ customer_name:'', phone:'', booking_date:'', booking_time:'', people_count:'' })
        setStep('map')
      } else {
        alert(d.message || 'เกิดข้อผิดพลาด')
      }
    } catch (err) {
      console.log(err)
      alert('Server Error')
    }
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    try {
      await fetch(`${API_URL}/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      fetchBookings()
    } catch {}
  }

  const del = async (id) => {
    if (!confirm('ยืนยันการลบ?')) return
    try {
      await fetch(`${API_URL}/api/bookings/${id}`, { method: 'DELETE' })
      fetchBookings()
    } catch {}
  }

  const renderTable = tb => {
    const booked = bookedIds.has(tb.id)
    const isSel = selected===tb.id
    const isHov = hov===tb.id && !booked
    const s = ZC[tb.z]
    const fill = booked ? s.book : isSel ? s.sel : isHov ? s.hov : s.free
    const labelSize = tb.id.length > 3 ? 7 : 8
    return (
      <g key={tb.id} style={{ cursor: booked?'not-allowed':'pointer' }}
        onClick={() => { if(!booked) setSelected(p => p===tb.id ? null : tb.id) }}
        onMouseEnter={() => setHov(tb.id)} onMouseLeave={() => setHov(null)}>
        <circle cx={tb.x+1} cy={tb.y+1.5} r={R} fill="rgba(0,0,0,0.45)" />
        <circle cx={tb.x} cy={tb.y} r={R} fill={fill}
          stroke={isSel ? 'rgba(255,255,255,0.9)' : booked ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.5)'}
          strokeWidth={isSel ? 1.8 : 1}
          style={{ transition:'fill 0.12s' }} />
        <text x={tb.x} y={tb.y-0.5} textAnchor="middle" dominantBaseline="central"
          fill={booked ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.95)'}
          fontSize={labelSize} fontWeight="700"
          style={{ pointerEvents:'none', userSelect:'none' }}>{tb.id}</text>
        {booked && <>
          <line x1={tb.x-7} y1={tb.y-7} x2={tb.x+7} y2={tb.y+7} stroke="rgba(255,255,255,0.16)" strokeWidth="1.5"/>
          <line x1={tb.x+7} y1={tb.y-7} x2={tb.x-7} y2={tb.y+7} stroke="rgba(255,255,255,0.16)" strokeWidth="1.5"/>
        </>}
      </g>
    )
  }

  const inp = {
    width:'100%', height:isMobile ? 48 : 42, padding:'0 14px', borderRadius:6,
    border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)',
    color:'#fff', fontSize:isMobile ? 16 : 13, fontFamily:'inherit', boxSizing:'border-box', outline:'none',
    transition:'border 0.18s, background 0.18s',
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      background:'#060101', color:'#fff',
      fontFamily:'"Inter","Sarabun","Kanit",system-ui,sans-serif',
    }}>

      {/* TOPBAR */}
<header style={{
  minHeight: 58,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 14px',
  background: 'rgba(4,0,0,0.98)',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
  position: 'sticky',
  top: 0,
  zIndex: 999,
}}>

  {/* LOGO */}
  <div style={{
    display:'flex',
    flexDirection:'column',
    justifyContent:'center'
  }}>
    <span style={{
      fontSize:14,
      fontWeight:800,
      letterSpacing:3,
      color:'#d4980a'
    }}>
      DUEM BAR
    </span>

    <span style={{
      fontSize:7,
      letterSpacing:2,
      color:'rgba(255,255,255,0.18)'
    }}>
      TABLE RESERVATION
    </span>
  </div>

  {/* DESKTOP MENU */}
  <nav style={{
    display: isMobile ? 'none' : 'flex',
    background:'rgba(255,255,255,0.04)',
    borderRadius:6,
    padding:3,
    gap:2
  }}>

    {[['map','Floor Plan'],['list','Bookings']].map(([s,l]) => (
      <button
        key={s}
        onClick={() => {

          if (s === 'list' && !admin) {

            const pass = prompt('Admin Password')

            if (pass !== 'duem2026') {
              alert('Wrong Password')
              return
            }

            setAdmin(true)
          }

          setStep(s)
        }}
        style={{
          padding:'6px 14px',
          borderRadius:4,
          border:'none',
          cursor:'pointer',
          fontFamily:'inherit',
          fontSize:11,
          fontWeight:600,
          background: step===s ? '#b83228' : 'transparent',
          color: step===s ? '#fff' : 'rgba(255,255,255,0.35)',
        }}
      >
        {l}
      </button>
    ))}
  </nav>

  {/* MOBILE HAMBURGER */}
  <button
    onClick={() => setMenuOpen(!menuOpen)}
    style={{
      display: isMobile ? 'flex' : 'none',
      flexDirection:'column',
      justifyContent:'center',
      gap:4,
      background:'transparent',
      border:'none',
      cursor:'pointer'
    }}
  >
    <span style={{
      width:22,
      height:2,
      background:'#fff',
      borderRadius:2
    }} />

    <span style={{
      width:22,
      height:2,
      background:'#fff',
      borderRadius:2
    }} />

    <span style={{
      width:22,
      height:2,
      background:'#fff',
      borderRadius:2
    }} />
  </button>
</header>

{/* MOBILE MENU */}
{menuOpen && (
  <div style={{
    position:'fixed',
    top:58,
    left:0,
    right:0,
    background:'#090101',
    borderBottom:'1px solid rgba(255,255,255,0.06)',
    zIndex:998,
    padding:'10px 14px',
    display:'flex',
    flexDirection:'column',
    gap:8
  }}>

    {[['map','Floor Plan'],['list','Bookings']].map(([s,l]) => (
      <button
        key={s}
        onClick={() => {

          if (s === 'list' && !admin) {

            const pass = prompt('Admin Password')

            if (pass !== 'duem2026') {
              alert('Wrong Password')
              return
            }

            setAdmin(true)
          }

          setStep(s)
          setMenuOpen(false)
        }}
        style={{
          height:42,
          borderRadius:6,
          border:'none',
          background: step===s ? '#b83228' : 'rgba(255,255,255,0.04)',
          color:'#fff',
          fontSize:13,
          fontWeight:700,
          cursor:'pointer'
        }}
      >
        {l}
      </button>
    ))}
  </div>
)}

      {/* MAP VIEW */}
      {step==='map' && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{
            flexShrink:0, padding:'8px 16px', display:'flex', gap:10, alignItems:'center',
            background:'rgba(0,0,0,0.5)', borderBottom:'1px solid rgba(255,255,255,0.04)', zIndex:100,
          }}>
            <Picker
              date={form.booking_date} time={form.booking_time}
              onDate={v => setForm({...form, booking_date:v})}
              onTime={v => setForm({...form, booking_time:v})}
            />
            <div style={{ display:'flex', gap:10, paddingLeft:6, flexShrink:0 }}>
              {[['#c0392b','ว่าง'],['#d4890a','เลือก'],['#2a0808','จอง']].map(([c,l]) => (
                <span key={l} style={{ display:'flex', alignItems:'center', gap:4, fontSize:9.5, color:'rgba(255,255,255,0.26)', whiteSpace:'nowrap' }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:c, display:'inline-block', border:'1px solid rgba(255,255,255,0.15)' }}/>
                  {l}
                </span>
              ))}
            </div>
          </div>

          <div style={{
  flex:1,
  overflow:'auto',
  background:'#1a1008',
  WebkitOverflowScrolling:'touch',
  padding:isMobile ? 6 : 0
}}>
            <div style={{ display:'inline-block', padding:14 }}>
              <svg
  viewBox="0 0 650 600"
  width={isMobile ? '100%' : '650'}
  height="auto"
  style={{ display:'block' }}
>
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
                <rect x="36" y="330" width="450" height="130" fill="url(#tile)"/>
                <rect x="36" y="470" width="335" height="76" fill="url(#cfloor)"/>
                <line x1="36" y1="330" x2="488" y2="330" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4,4"/>
                <line x1="36" y1="470" x2="374" y2="470" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4,4"/>
                <text x="36" y="200" fontSize="8" fontWeight="700" fill="rgba(255,255,255,0.1)" letterSpacing="2" transform="rotate(-90 36 210)">ZONE A</text>
                <text x="36" y="410" fontSize="8" fontWeight="700" fill="rgba(255,255,255,0.1)" letterSpacing="2" transform="rotate(-90 36 420)">ZONE B</text>
                <text x="36" y="552" fontSize="8" fontWeight="700" fill="rgba(255,255,255,0.1)" letterSpacing="2" transform="rotate(-90 36 562)">ZONE C</text>
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
                <text x="623" y="65" textAnchor="middle" fill="rgba(255,255,255,0.1)" fontSize="6.5" fontWeight="600" letterSpacing="1.5" transform="rotate(-90 623 65)">COMING SOON</text>
                <rect x="602" y="232" width="42" height="30" rx="3" fill="#0e0820" stroke="#0c0618" strokeWidth="1"/>
                <text x="623" y="251" textAnchor="middle" fill="rgba(140,140,220,0.55)" fontSize="14">♂</text>
                <rect x="602" y="268" width="42" height="30" rx="3" fill="#200810" stroke="#180610" strokeWidth="1"/>
                <text x="623" y="287" textAnchor="middle" fill="rgba(220,140,150,0.55)" fontSize="14">♀</text>
                <rect x="602" y="312" width="42" height="50" rx="3" fill="#200c04" stroke="#301408" strokeWidth="1" strokeDasharray="3,3"/>
                <text x="623" y="340" textAnchor="middle" fill="rgba(255,170,100,0.6)" fontSize="8.5" fontWeight="600" letterSpacing="0.8">ครัว</text>
                {[[530,110],[225,360]].map(([cx,cy],i) => (
                  <g key={i}>
                    <ellipse cx={cx} cy={cy+20} rx={14} ry={8} fill="#0e0c04" opacity="0.8"/>
                    <circle cx={cx-9} cy={cy+4} r={12} fill="#0e3818" opacity="0.9"/>
                    <circle cx={cx+9} cy={cy+4} r={12} fill="#124820" opacity="0.9"/>
                    <circle cx={cx} cy={cy-6} r={14} fill="#0a2e14" opacity="0.95"/>
                    <circle cx={cx} cy={cy-6} r={6} fill="#1a6030" opacity="0.4"/>
                  </g>
                ))}
                {[
                  [226, 235],[290, 215],[385, 215],[139, 235],[320, 255],
                ].map(([cx, cy], i) => (
                  <g key={`pillar-${i}`}>
                    <rect x={cx-7} y={cy-7} width="7" height="7" fill="none" stroke="#000000" strokeWidth="1.5"/>
                  </g>
                ))}
                {TABLES.map(renderTable)}
              </svg>
            </div>
          </div>

          {selected && (
            <div style={{
              flexShrink:0, minHeight:isMobile ? 82 : 56, display:'flex', alignItems:'center',
              justifyContent:'space-between',flexDirection:isMobile ? 'column' : 'row',
alignItems:isMobile ? 'stretch' : 'center',
gap:isMobile ? 10 : 0, padding:isMobile ? '10px 14px' : '0 16px',
              background:'#0a0000', borderTop:'1px solid rgba(184,50,40,0.28)',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{
                  width:34, height:34, borderRadius:5, flexShrink:0,
                  background:'rgba(184,50,40,0.18)', border:'1px solid rgba(184,50,40,0.38)',
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                }}>
                  <span style={{ fontSize:6, color:'rgba(255,255,255,0.25)', fontWeight:700, letterSpacing:1 }}>TBL</span>
                  <span style={{ fontSize:12, fontWeight:800, color:'#f0a020', lineHeight:1.1 }}>{selected}</span>
                </div>
                <div>
                  <div style={{ fontSize:8, color:'rgba(255,255,255,0.2)', fontWeight:700, letterSpacing:2 }}>SELECTED</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)', marginTop:1 }}>
                    {form.booking_date && form.booking_time
                      ? `${form.booking_date}  ·  ${form.booking_time}`
                      : 'เลือกวันและเวลาด้านบนก่อน'}
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', gap:7 }}>
                <button onClick={() => setSelected(null)} style={{
                  height:30, padding:'0 13px', borderRadius:5, border:'1px solid rgba(255,255,255,0.07)',
                  background:'transparent', color:'rgba(255,255,255,0.28)', fontSize:11,
                  cursor:'pointer', fontFamily:'inherit', fontWeight:500,
                }}>ยกเลิก</button>
                <button onClick={() => setStep('form')} style={{
                  height:30, padding:'0 16px', borderRadius:5, border:'none',
                  background:'#b83228', color:'#fff', fontSize:11, fontWeight:700,
                  cursor:'pointer', fontFamily:'inherit', letterSpacing:0.8,
                  boxShadow:'0 2px 12px rgba(184,50,40,0.45)',
                }}>ดำเนินการต่อ</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FORM VIEW */}
      {step==='form' && (
        <div style={{ flex:1, overflow:'auto', display:'flex', flexDirection:'column', alignItems:'center', padding:'26px 20px 60px' }}>
          <div style={{ width:'100%', maxWidth:isMobile ? '100%' : 380 }}>
            <button onClick={() => setStep('map')} style={{
              background:'none', border:'none', color:'rgba(255,255,255,0.25)', fontSize:11,
              cursor:'pointer', fontFamily:'inherit', padding:0, marginBottom:20,
              display:'flex', alignItems:'center', gap:5, fontWeight:500, letterSpacing:0.5,
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              กลับแผนผัง
            </button>
            <div style={{
              display:'flex', alignItems:'center', gap:14, padding:'13px 15px',
              background:'rgba(184,50,40,0.08)', border:'1px solid rgba(184,50,40,0.2)',
              borderRadius:7, marginBottom:16,
            }}>
              <div style={{
                width:44, height:44, borderRadius:6, flexShrink:0,
                background:'rgba(184,50,40,0.16)', border:'1px solid rgba(184,50,40,0.35)',
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              }}>
                <span style={{ fontSize:6.5, color:'rgba(255,255,255,0.25)', fontWeight:700, letterSpacing:1 }}>TABLE</span>
                <span style={{ fontSize:18, fontWeight:800, color:'#f0a020', lineHeight:1.1 }}>{selected}</span>
              </div>
              <div>
                <div style={{ fontSize:8, color:'rgba(255,255,255,0.2)', fontWeight:700, letterSpacing:2, marginBottom:4 }}>RESERVATION</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.55)' }}>{form.booking_date||'—'}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.55)' }}>{form.booking_time||'—'}</div>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:8 }}>
              <input style={inp} type="text" placeholder="ชื่อ-นามสกุล"
                value={form.customer_name} onChange={e => setForm({...form, customer_name:e.target.value})}
                onFocus={e => { e.target.style.border='1px solid rgba(184,50,40,0.52)'; e.target.style.background='rgba(184,50,40,0.06)' }}
                onBlur={e => { e.target.style.border='1px solid rgba(255,255,255,0.08)'; e.target.style.background='rgba(255,255,255,0.04)' }}/>
              <input style={inp} type="tel" placeholder="เบอร์โทรศัพท์"
                value={form.phone} onChange={e => setForm({...form, phone:e.target.value})}
                onFocus={e => { e.target.style.border='1px solid rgba(184,50,40,0.52)'; e.target.style.background='rgba(184,50,40,0.06)' }}
                onBlur={e => { e.target.style.border='1px solid rgba(255,255,255,0.08)'; e.target.style.background='rgba(255,255,255,0.04)' }}/>
              <input style={inp} type="number" placeholder="จำนวนคน" min="1" max="20"
                value={form.people_count} onChange={e => setForm({...form, people_count:e.target.value})}
                onFocus={e => { e.target.style.border='1px solid rgba(184,50,40,0.52)'; e.target.style.background='rgba(184,50,40,0.06)' }}
                onBlur={e => { e.target.style.border='1px solid rgba(255,255,255,0.08)'; e.target.style.background='rgba(255,255,255,0.04)' }}/>
              {(!form.booking_date || !form.booking_time) && (
                <div style={{ marginTop:4 }}>
                  <Picker
                    date={form.booking_date} time={form.booking_time}
                    onDate={v => setForm({...form, booking_date:v})}
                    onTime={v => setForm({...form, booking_time:v})}
                  />
                </div>
              )}
            </div>
            <button onClick={handleSubmit} disabled={loading} style={{
              width:'100%', height:isMobile ? 50 : 42, borderRadius:6, border:'none',
              background: loading ? 'rgba(100,25,20,0.45)' : '#b83228',
              color:'#fff', fontSize:13, fontWeight:700,
              cursor: loading?'not-allowed':'pointer',
              fontFamily:'inherit', letterSpacing:1,
              boxShadow: loading ? 'none' : '0 4px 18px rgba(184,50,40,0.4)',
              transition:'all 0.2s',
            }}>{loading ? 'กำลังจอง...' : 'ยืนยันการจอง'}</button>
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {step==='list' && (
        <div style={{ flex:1, overflow:'auto', padding:'22px 20px' }}>
          <div style={{ maxWidth:510, margin:'0 auto' }}>
            <div style={{ fontSize:8, letterSpacing:3, color:'rgba(255,255,255,0.15)', fontWeight:700, marginBottom:16 }}>BOOKING LIST</div>
            {bookings.length===0 && (
              <div style={{ color:'rgba(255,255,255,0.1)', textAlign:'center', padding:'80px 0', fontSize:11, letterSpacing:2 }}>NO RESERVATIONS</div>
            )}
            {bookings.map(b => {
              const SC = { confirmed:'#27ae60', cancelled:'#e74c3c', pending:'#e8a000' }
              const SL = { confirmed:'Confirmed', cancelled:'Cancelled', pending:'Pending' }
              const sc = SC[b.status]||'#e8a000'
              return (
                <div key={b.id} style={{
                  background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)',
                  borderLeft:`2px solid ${sc}`, borderRadius:7, padding:'12px 14px', marginBottom:6,
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:7 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13, color:'rgba(255,255,255,0.84)' }}>{b.customer_name}</div>
                      <div style={{ color:'rgba(255,255,255,0.24)', fontSize:11, marginTop:1.5 }}>{b.phone}</div>
                    </div>
                    <span style={{
                      fontSize:8, fontWeight:700, letterSpacing:0.8, padding:'3px 9px',
                      borderRadius:20, background:sc+'16', color:sc, border:`1px solid ${sc}25`,
                    }}>{SL[b.status]}</span>
                  </div>
                  <div style={{ display:'flex', gap:12, fontSize:11, color:'rgba(255,255,255,0.32)', marginBottom:10 }}>
                    <span style={{ color:'rgba(255,255,255,0.6)', fontWeight:600 }}>{b.bar_tables?.table_name||b.table_id}</span>
                    <span>{b.booking_date}</span>
                    <span>{b.booking_time}</span>
                    {b.people_count && <span>{b.people_count} คน</span>}
                  </div>
                  <div style={{ display:'flex', gap:5 }}>
                    {[['Confirm','#27ae60','confirmed'],['Cancel','#e8a000','cancelled'],['Delete','#e74c3c',null]].map(([l,c,s]) => (
                      <button key={l} onClick={() => s ? updateStatus(b.id,s) : del(b.id)} style={{
                        padding:'4px 11px', borderRadius:4, border:`1px solid ${c}20`,
                        background:`${c}08`, color:c, cursor:'pointer', fontFamily:'inherit',
                        fontSize:10, fontWeight:600, letterSpacing:0.5, transition:'background 0.12s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background=c+'1e'}
                        onMouseLeave={e => e.currentTarget.style.background=c+'08'}
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
