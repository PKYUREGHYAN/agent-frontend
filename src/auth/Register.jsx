import { useEffect, useState } from 'react'

import {
    CheckCircle2,
    Sparkles,
    CircleCheck,
    Circle
} from 'lucide-react'

import './Register.css'
import { I18nTree, LanguageSwitch } from '../i18n/I18n.jsx'
import { AUTH_API_URL } from '../services/api.js'
import { loadRegisterDraft, saveRegisterDraft } from '../services/uiSession.js'


function Register({ onLogin, onSuccess }) {

    // =========================================================
    // FORM STATE
    // =========================================================

    const registerDraft = loadRegisterDraft()
    const [username, setUsername] = useState(registerDraft.username || '')
    const [email, setEmail] = useState(registerDraft.email || '')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    useEffect(() => {
        saveRegisterDraft({ username, email })
    }, [username, email])


    // =========================================================
    // UI STATE
    // =========================================================

    const [message, setMessage] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)


    // =========================================================
    // PASSWORD RULES
    // =========================================================

    const passwordRules = {

        length:
            password.length >= 8,

        uppercase:
            /[A-Z]/.test(password),

        lowercase:
            /[a-z]/.test(password),

        number:
            /[0-9]/.test(password),

        special:
            /[^A-Za-z0-9]/.test(password),

    }


    const isPasswordValid =
        passwordRules.length &&
        passwordRules.uppercase &&
        passwordRules.lowercase &&
        passwordRules.number &&
        passwordRules.special


    // =========================================================
    // FORM SUBMIT
    // =========================================================

    const handleSubmit = async (e) => {

        e.preventDefault()

        setMessage('')
        setSuccess(false)


        // -------------------------------------------------------
        // CLEAN DATA
        // -------------------------------------------------------

        const cleanUsername = username.trim()
        const cleanEmail = email.trim().toLowerCase()


        // -------------------------------------------------------
        // CHECK EMPTY FIELDS
        // -------------------------------------------------------

        if (
            !cleanUsername ||
            !cleanEmail ||
            !password ||
            !confirmPassword
        ) {

            setMessage(
                'Խնդրում ենք լրացնել բոլոր դաշտերը'
            )

            return
        }


        // -------------------------------------------------------
        // USERNAME VALIDATION
        // -------------------------------------------------------

        if (cleanUsername.length < 3) {

            setMessage(
                'Username-ը պետք է ունենա առնվազն 3 նիշ'
            )

            return
        }


        if (cleanUsername.length > 30) {

            setMessage(
                'Username-ը կարող է ունենալ առավելագույնը 30 նիշ'
            )

            return
        }


        if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {

            setMessage(
                'Username-ը կարող է պարունակել միայն տառեր, թվեր և _'
            )

            return
        }


        // -------------------------------------------------------
        // EMAIL VALIDATION
        // -------------------------------------------------------

        if (cleanEmail.length > 254) {

            setMessage(
                'Email-ը չափազանց երկար է'
            )

            return
        }


        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/


        if (!emailRegex.test(cleanEmail)) {

            setMessage(
                'Email-ի ձևաչափը սխալ է'
            )

            return
        }


        // -------------------------------------------------------
        // PASSWORD VALIDATION
        // -------------------------------------------------------

        if (!isPasswordValid) {

            setMessage(
                'Գաղտնաբառը չի համապատասխանում պահանջներին'
            )

            return
        }


        // -------------------------------------------------------
        // BCRYPT PASSWORD LIMIT
        // -------------------------------------------------------

        if (
            new TextEncoder().encode(password).length > 72
        ) {

            setMessage(
                'Գաղտնաբառը չափազանց երկար է'
            )

            return
        }


        // -------------------------------------------------------
        // PASSWORD CONFIRMATION
        // -------------------------------------------------------

        if (password !== confirmPassword) {

            setMessage(
                'Գաղտնաբառերը չեն համընկնում'
            )

            return
        }


        // -------------------------------------------------------
        // START LOADING
        // -------------------------------------------------------

        setLoading(true)


        try {

            // ---------------------------------------------------
            // SEND REGISTER REQUEST
            // ---------------------------------------------------

            const response = await fetch(
                `${AUTH_API_URL}/register`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json',
                    },

                    body: JSON.stringify({
                        username: cleanUsername,
                        email: cleanEmail,
                        password,
                        confirmPassword,
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

                setMessage(
                    data.message ||
                    'Գրանցումը չհաջողվեց'
                )

                return
            }


            // ---------------------------------------------------
            // SUCCESS
            // ---------------------------------------------------

            setSuccess(true)
            setMessage(`Բարի գալուստ, @${data.user.username}`)

            localStorage.setItem('accessToken', data.accessToken)
            localStorage.setItem('refreshToken', data.refreshToken)
            localStorage.setItem('currentUser', JSON.stringify(data.user))

            setUsername('')
            setEmail('')
            setPassword('')
            setConfirmPassword('')

            setTimeout(() => {
                if (onSuccess) {
                    onSuccess({
                        user: data.user,
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                    })
                    return
                }

                if (onLogin) {
                    onLogin()
                }
            }, 800)

        } catch (error) {

            console.error(
                'Register error:',
                error
            )

            setMessage(
                'Չհաջողվեց միանալ server-ին'
            )

        } finally {

            setLoading(false)

        }
    }


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <I18nTree>
        <div className="login-page">
            <div className="lang-switch-floating">
                <LanguageSwitch />
            </div>

            <div className="login-card">


                {/* =================================================
                    LOGO
                ================================================= */}

                <div className="login-avatar-wrapper">

                    <div className="login-avatar-glow" />

                    <img
                        src="/images/level-home-logo.jpg"
                        alt="LEVEL HOME • Агент 1"
                        className="login-avatar-img"
                    />

                </div>


                {/* =================================================
                    TITLE
                ================================================= */}

                <h1>
                    LEVEL HOME • Агент 1
                </h1>

                <p>
                    Ստեղծիր նոր հաշիվ
                </p>


                {/* =================================================
                    REGISTER FORM
                ================================================= */}

                <form onSubmit={handleSubmit}>


                    {/* =================================================
                        USERNAME
                    ================================================= */}

                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => {

                            setUsername(e.target.value)

                            setMessage('')
                            setSuccess(false)

                        }}
                        autoComplete="username"
                        required
                    />


                    {/* =================================================
                        EMAIL
                    ================================================= */}

                    <input
                        type="email"
                        placeholder="Gmail (էլ․ փոստ)"
                        value={email}
                        onChange={(e) => {

                            setEmail(e.target.value)

                            setMessage('')
                            setSuccess(false)

                        }}
                        autoComplete="email"
                        required
                    />


                    {/* =================================================
                        PASSWORD
                    ================================================= */}

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => {

                            setPassword(e.target.value)

                            setMessage('')
                            setSuccess(false)

                        }}
                        autoComplete="new-password"
                        required
                    />


                    {/* =================================================
                        PASSWORD REQUIREMENTS
                    ================================================= */}

                    {password.length > 0 && (

                        <div className="password-requirements">

                            <div className="password-requirements-title">
                                Գաղտնաբառի պայմաններ
                            </div>


                            {/* Minimum length */}

                            <div
                                className={`password-rule ${
                                    passwordRules.length
                                        ? 'valid'
                                        : ''
                                }`}
                            >

                                {passwordRules.length ? (
                                    <CircleCheck size={17} />
                                ) : (
                                    <Circle size={17} />
                                )}

                                <span>
                                    Առնվազն 8 նիշ
                                </span>

                            </div>


                            {/* Uppercase */}

                            <div
                                className={`password-rule ${
                                    passwordRules.uppercase
                                        ? 'valid'
                                        : ''
                                }`}
                            >

                                {passwordRules.uppercase ? (
                                    <CircleCheck size={17} />
                                ) : (
                                    <Circle size={17} />
                                )}

                                <span>
                                    Առնվազն 1 մեծատառ
                                </span>

                            </div>


                            {/* Lowercase */}

                            <div
                                className={`password-rule ${
                                    passwordRules.lowercase
                                        ? 'valid'
                                        : ''
                                }`}
                            >

                                {passwordRules.lowercase ? (
                                    <CircleCheck size={17} />
                                ) : (
                                    <Circle size={17} />
                                )}

                                <span>
                                    Առնվազն 1 փոքրատառ
                                </span>

                            </div>


                            {/* Number */}

                            <div
                                className={`password-rule ${
                                    passwordRules.number
                                        ? 'valid'
                                        : ''
                                }`}
                            >

                                {passwordRules.number ? (
                                    <CircleCheck size={17} />
                                ) : (
                                    <Circle size={17} />
                                )}

                                <span>
                                    Առնվազն 1 թիվ
                                </span>

                            </div>


                            {/* Special character */}

                            <div
                                className={`password-rule ${
                                    passwordRules.special
                                        ? 'valid'
                                        : ''
                                }`}
                            >

                                {passwordRules.special ? (
                                    <CircleCheck size={17} />
                                ) : (
                                    <Circle size={17} />
                                )}

                                <span>
                                    Առնվազն 1 հատուկ նշան
                                </span>

                            </div>

                        </div>

                    )}


                    {/* =================================================
                        CONFIRM PASSWORD
                    ================================================= */}

                    <input
                        type="password"
                        placeholder="Կրկնել password-ը"
                        value={confirmPassword}
                        onChange={(e) => {

                            setConfirmPassword(
                                e.target.value
                            )

                            setMessage('')
                            setSuccess(false)

                        }}
                        autoComplete="new-password"
                        required
                    />


                    {/* =================================================
                        REGISTER BUTTON
                    ================================================= */}

                    <button
                        type="submit"
                        disabled={loading}
                    >

                        {loading
                            ? 'Գրանցվում է...'
                            : 'Գրանցվել'}

                    </button>

                </form>


                {/* =================================================
                    ERROR BANNER
                ================================================= */}

                {message && !success && (

                    <div className="register-banner error">

                        <div className="register-banner-icon">
                            !
                        </div>

                        <div className="register-banner-content">

                            <strong>
                                Սխալ
                            </strong>

                            <span>
                                {message}
                            </span>

                        </div>

                    </div>

                )}


                {/* =================================================
                    SUCCESS BANNER
                ================================================= */}

                {success && (

                    <div className="register-banner success">

                        <div className="register-banner-icon">

                            <CheckCircle2 size={22} />

                        </div>

                        <div className="register-banner-content">

                            <strong>

                                Գրանցումը հաջողվեց

                                <Sparkles size={15} />

                            </strong>

                            <span>
                                Բարի գալուստ, ձեր հաշիվը
                                հաջողությամբ ստեղծվեց։
                            </span>

                        </div>

                    </div>

                )}


                {/* =================================================
                    LOGIN LINK
                ================================================= */}

                <div className="register-link">

                    <span>
                        Արդեն ունե՞ս հաշիվ։
                    </span>

                    <button
                        type="button"
                        onClick={onLogin}
                    >
                        Մուտք գործել
                    </button>

                </div>

            </div>

        </div>
        </I18nTree>
    )
}


export default Register