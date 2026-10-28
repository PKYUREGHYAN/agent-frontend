import { useEffect, useState } from 'react'

import {
    User,
    Lock,
    Eye,
    EyeOff,
    Send,
    CheckCircle2,
    Mail,
    ShieldCheck
} from 'lucide-react'

import './Login.css'
import { I18nTree, LanguageSwitch } from '../i18n/I18n.jsx'
import InstallApp from '../pwa/InstallApp.jsx'
import { AUTH_API_URL } from '../services/api.js'
import { loadLoginDraft, saveLoginDraft } from '../services/uiSession.js'


function Login({
                   onRegister,
                   onSuccess,
                   isCompact = false
               }) {

    // =========================================================
    // FORM STATE
    // =========================================================

    const loginDraft = loadLoginDraft()
    const [username, setUsername] = useState(loginDraft.username || '')
    const [email, setEmail] = useState('')
    const [resetCode, setResetCode] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [forgotMode, setForgotMode] = useState(false)
    const [resetStep, setResetStep] = useState('request')

    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(
        loginDraft.rememberMe !== false
    )

    useEffect(() => {
        saveLoginDraft({ username, rememberMe })
    }, [username, rememberMe])


    // =========================================================
    // UI STATE
    // =========================================================

    const [message, setMessage] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)


    // =========================================================
    // LOGIN
    // =========================================================

    const handleForgotSubmit = async (e) => {

        e.preventDefault()

        setMessage('')
        setSuccess(false)

        const cleanUsername = username.trim()
        const cleanEmail = email.trim().toLowerCase()

        if (!cleanUsername || !cleanEmail) {
            setMessage('Գրեք և username-ը, և գրանցման email-ը')
            return
        }

        setLoading(true)

        try {
            if (resetStep === 'request') {
                const response = await fetch(
                    `${AUTH_API_URL}/forgot-password/request`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            username: cleanUsername,
                            email: cleanEmail,
                        }),
                    }
                )

                const data = await response.json().catch(() => ({}))

                if (!response.ok || !data.success) {
                    setSuccess(false)
                    setMessage(data.message || 'Կոդը չհաջողվեց ուղարկել')
                    return
                }

                setSuccess(true)
                setMessage(data.message)
                setResetStep('confirm')
                return
            }

            if (!resetCode.trim() || !password || !confirmPassword) {
                setMessage('Լրացրեք կոդը և նոր գաղտնաբառը')
                return
            }

            if (password !== confirmPassword) {
                setMessage('Գաղտնաբառերը չեն համընկնում')
                return
            }

            const response = await fetch(
                `${AUTH_API_URL}/forgot-password/confirm`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: cleanUsername,
                        email: cleanEmail,
                        code: resetCode.trim(),
                        password,
                        confirmPassword,
                    }),
                }
            )

            const data = await response.json().catch(() => ({}))

            if (!response.ok || !data.success) {
                setSuccess(false)
                setMessage(data.message || 'Գաղտնաբառը չհաջողվեց փոխել')
                return
            }

            setSuccess(true)
            setMessage(data.message || 'Գաղտնաբառը փոխվեց')
            setPassword('')
            setConfirmPassword('')
            setResetCode('')
            setForgotMode(false)
            setResetStep('request')
        } catch {
            setSuccess(false)
            setMessage('Սերվերի հետ կապ չկա')
        } finally {
            setLoading(false)
        }
    }


    const handleSubmit = async (e) => {

        e.preventDefault()

        if (forgotMode) {
            await handleForgotSubmit(e)
            return
        }

        setMessage('')
        setSuccess(false)


        // -------------------------------------------------------
        // CLEAN DATA
        // -------------------------------------------------------

        const cleanUsername = username.trim()


        // -------------------------------------------------------
        // CHECK FIELDS
        // -------------------------------------------------------

        if (!cleanUsername || !password) {

            setMessage(
                'Խնդրում ենք լրացնել բոլոր դաշտերը'
            )

            return
        }


        // -------------------------------------------------------
        // START LOADING
        // -------------------------------------------------------

        setLoading(true)


        try {

            // ---------------------------------------------------
            // SEND LOGIN REQUEST TO BACKEND
            // ---------------------------------------------------

            const response = await fetch(
                `${AUTH_API_URL}/login`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json',
                    },

                    body: JSON.stringify({
                        username: cleanUsername,
                        password,
                    }),
                }
            )


            // ---------------------------------------------------
            // READ RESPONSE
            // ---------------------------------------------------

            const data = await response.json()


            // ---------------------------------------------------
            // BACKEND ERROR
            // ---------------------------------------------------

            if (!response.ok) {

                setSuccess(false)

                setMessage(
                    data.message ||
                    'Մուտքը չհաջողվեց'
                )

                return
            }


            // ---------------------------------------------------
            // SAVE TOKENS
            // ---------------------------------------------------

            if (rememberMe) {

                localStorage.setItem(
                    'accessToken',
                    data.accessToken
                )

                localStorage.setItem(
                    'refreshToken',
                    data.refreshToken
                )

                localStorage.setItem(
                    'currentUser',
                    JSON.stringify(data.user)
                )

            } else {

                sessionStorage.setItem(
                    'accessToken',
                    data.accessToken
                )

                sessionStorage.setItem(
                    'refreshToken',
                    data.refreshToken
                )

                sessionStorage.setItem(
                    'currentUser',
                    JSON.stringify(data.user)
                )
            }


            // ---------------------------------------------------
            // SUCCESS
            // ---------------------------------------------------

            setSuccess(true)

            setMessage(
                `Բարի գալուստ, @${data.user.username} ✨`
            )


            // ---------------------------------------------------
            // SEND USER DATA TO AUTH
            // ---------------------------------------------------

            if (onSuccess) {

                onSuccess({
                    user: data.user,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                    rememberMe,
                })
            }


        } catch (error) {

            console.error(
                'Login error:',
                error
            )

            setSuccess(false)

            setMessage(
                'Չհաջողվեց միանալ server-ին'
            )

        } finally {

            setLoading(false)

        }
    }


    return (
        <div className="login-page">

            <div
                className={`login-container ${
                    isCompact ? 'compact' : ''
                }`}
            >

                {/* =================================================
                    LEFT SHOWCASE
                ================================================= */}

                {!isCompact && (

                    <div className="login-showcase-banner">

                        <div>

                            {/* Badge */}

                            <div className="homework-badge">

                                <span className="homework-badge-dot" />

                                <span>
                                    Տնային Աշխատանք • Telegram AI Chat
                                </span>

                            </div>


                            {/* Showcase image */}

                            <div className="showcase-image-wrapper">

                                <img
                                    src="/images/tg_ai_art_1788848065575.jpg"
                                    alt="Telegram AI Assistant 3D"
                                    className="showcase-image"
                                />

                            </div>


                            {/* Showcase content */}

                            <div className="showcase-content">

                                <h2>
                                    Արհեստական Բանականություն Telegram-ում
                                </h2>

                                <p>
                                    Ժամանակակից, արագ և անվտանգ
                                    հաղորդակցություն խելացի AI
                                    օգնականի հետ։
                                </p>


                                <ul className="showcase-features">

                                    <li className="showcase-feature-item">

                                        <span className="feature-check">
                                            ✓
                                        </span>

                                        <span>
                                            AI ինտեգրացիա
                                        </span>

                                    </li>


                                    <li className="showcase-feature-item">

                                        <span className="feature-check">
                                            ✓
                                        </span>

                                        <span>
                                            Գաղտնիության բարձր պաշտպանություն
                                        </span>

                                    </li>


                                    <li className="showcase-feature-item">

                                        <span className="feature-check">
                                            ✓
                                        </span>

                                        <span>
                                            Էլեգանտ և հարմարավետ դիզայն
                                        </span>

                                    </li>

                                </ul>

                            </div>

                        </div>


                        {/* Footer */}

                        <div
                            style={{
                                marginTop: '24px',
                                fontSize: '12px',
                                color: '#64748b'
                            }}
                        >
                            Web & Design IT Project • 2026
                        </div>

                    </div>

                )}


                {/* =================================================
                    LOGIN CARD
                ================================================= */}

                <div className="login-card">

                    {/* Logo */}

                    <div className="login-avatar-wrapper">

                        <div className="login-avatar-glow" />

                        <img
                            src="/images/level-home-logo.jpg"
                            alt="LEVEL HOME • Агент 1"
                            className="login-avatar-img"
                        />

                    </div>


                    {/* Title */}

                    <h1>
                        LEVEL HOME • Агент 1
                    </h1>

                    <p>
                        {forgotMode
                            ? 'Ստուգում ենք, որ դուք եք'
                            : 'Մուտք գործիր համակարգ'}
                    </p>


                    {/* =================================================
                        LOGIN FORM
                    ================================================= */}

                    <form onSubmit={handleSubmit}>

                        {/* Username / Email */}

                        <div className="input-group has-leading-icon">

                            <span className="input-icon">
                                <User size={18} />
                            </span>

                            <input
                                type="text"
                                placeholder={
                                    forgotMode
                                        ? 'Username'
                                        : 'Username կամ Email'
                                }
                                value={username}
                                onChange={(e) => {

                                    setUsername(e.target.value)

                                    setMessage('')
                                    setSuccess(false)

                                }}
                                autoComplete="username"
                                required
                            />

                        </div>


                        {forgotMode && (

                            <div className="input-group has-leading-icon">

                                <span className="input-icon">
                                    <Mail size={18} />
                                </span>

                                <input
                                    type="email"
                                    placeholder="Գրանցման Gmail"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value)
                                        setMessage('')
                                        setSuccess(false)
                                    }}
                                    autoComplete="email"
                                    required
                                />

                            </div>

                        )}


                        {forgotMode && resetStep === 'confirm' && (

                            <div className="input-group has-leading-icon">

                                <span className="input-icon">
                                    <ShieldCheck size={18} />
                                </span>

                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Gmail-ի 6 նիշանոց կոդ"
                                    value={resetCode}
                                    onChange={(e) => {
                                        setResetCode(e.target.value)
                                        setMessage('')
                                        setSuccess(false)
                                    }}
                                    autoComplete="one-time-code"
                                    required
                                />

                            </div>

                        )}


                        {(!forgotMode || resetStep === 'confirm') && (

                            <>

                        <div className="input-group has-leading-icon has-trailing-icon">

                            <span className="input-icon">
                                <Lock size={18} />
                            </span>

                            <input
                                type={
                                    showPassword
                                        ? 'text'
                                        : 'password'
                                }
                                placeholder={
                                    forgotMode
                                        ? 'Նոր գաղտնաբառ'
                                        : 'Password'
                                }
                                value={password}
                                onChange={(e) => {

                                    setPassword(e.target.value)

                                    setMessage('')
                                    setSuccess(false)

                                }}
                                autoComplete={
                                    forgotMode
                                        ? 'new-password'
                                        : 'current-password'
                                }
                                required
                            />


                            {/* Show / Hide password */}

                            <button
                                type="button"
                                className="input-action-btn"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                                title={
                                    showPassword
                                        ? 'Թաքցնել'
                                        : 'Ցուցադրել'
                                }
                                tabIndex={-1}
                            >

                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}

                            </button>

                        </div>


                        {forgotMode && (

                            <div className="input-group has-leading-icon">

                                <span className="input-icon">
                                    <Lock size={18} />
                                </span>

                                <input
                                    type={
                                        showPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    placeholder="Կրկնել գաղտնաբառը"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value)
                                        setMessage('')
                                        setSuccess(false)
                                    }}
                                    autoComplete="new-password"
                                    required
                                />

                            </div>

                        )}

                            </>

                        )}


                        {/* =================================================
                            OPTIONS
                        ================================================= */}

                        <div className="form-options">

                            <label className="remember-label">

                                <input
                                    type="checkbox"
                                    className="remember-checkbox"
                                    checked={rememberMe}
                                    onChange={(e) =>
                                        setRememberMe(
                                            e.target.checked
                                        )
                                    }
                                />

                                <span>
                                    Հիշել ինձ
                                </span>

                            </label>


                            <button
                                type="button"
                                className="forgot-link"
                                onClick={() => {
                                    setForgotMode((prev) => !prev)
                                    setPassword('')
                                    setConfirmPassword('')
                                    setEmail('')
                                    setResetCode('')
                                    setResetStep('request')
                                    setMessage('')
                                    setSuccess(false)
                                }}
                            >
                                {forgotMode
                                    ? 'Վերադառնալ մուտքին'
                                    : 'Մոռացե՞լ ես'}
                            </button>

                        </div>


                        {/* =================================================
                            LOGIN BUTTON
                        ================================================= */}

                        <button
                            type="submit"
                            disabled={loading}
                        >

                            <span>

                                {loading
                                    ? (forgotMode
                                        ? 'Փոխվում է...'
                                        : 'Մուտք է կատարվում...')
                                    : (forgotMode
                                        ? (resetStep === 'confirm'
                                            ? 'Փոխել գաղտնաբառը'
                                            : 'Ուղարկել կոդը Gmail')
                                        : 'Մուտք գործել')}

                            </span>


                            {!loading && (
                                <Send size={16} />
                            )}

                        </button>

                    </form>


                    {/* =================================================
                        SUCCESS / ERROR MESSAGE
                    ================================================= */}

                    {message && (

                        <div
                            className={`login-message ${
                                success
                                    ? 'success'
                                    : 'error'
                            }`}
                        >

                            {success && (
                                <CheckCircle2 size={16} />
                            )}

                            <span>
                                {message}
                            </span>

                        </div>

                    )}


                    {/* =================================================
                        REGISTER
                    ================================================= */}

                    <div className="register-link">

                        <span>
                            Դեռ հաշիվ չունե՞ս։
                        </span>

                        <button
                            type="button"
                            onClick={onRegister}
                        >
                            Գրանցվել
                        </button>

                    </div>

                    <InstallApp />

                </div>

            </div>

        </div>
    )
}


export default Login