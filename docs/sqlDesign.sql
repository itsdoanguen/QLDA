--
-- PostgreSQL database dump
--

\restrict xmNqdF4oIM7L4WolZrxTdvGXbl8TfV65ewt0un9DrUHHNK7ZrL8E1xdPdLEylEk

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-04-27 14:09:43

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 245 (class 1259 OID 16608)
-- Name: approval_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.approval_requests (
    id integer NOT NULL,
    record_id integer,
    request_type character varying(100),
    status character varying(50),
    created_at timestamp without time zone
);


ALTER TABLE public.approval_requests OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 16607)
-- Name: approval_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.approval_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.approval_requests_id_seq OWNER TO postgres;

--
-- TOC entry 5241 (class 0 OID 0)
-- Dependencies: 244
-- Name: approval_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.approval_requests_id_seq OWNED BY public.approval_requests.id;


--
-- TOC entry 225 (class 1259 OID 16425)
-- Name: blockchain_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blockchain_logs (
    tx_hash character varying(255) NOT NULL,
    action_type character varying(100),
    gas_fee numeric(18,8),
    status character varying(50),
    "timestamp" timestamp without time zone
);


ALTER TABLE public.blockchain_logs OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 16673)
-- Name: cached_provenance_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cached_provenance_logs (
    id integer NOT NULL,
    token_id character varying(255),
    event_type character varying(100),
    event_data text,
    tx_hash character varying(255),
    block_number integer,
    cached_at timestamp without time zone
);


ALTER TABLE public.cached_provenance_logs OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 16672)
-- Name: cached_provenance_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cached_provenance_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cached_provenance_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5242 (class 0 OID 0)
-- Dependencies: 249
-- Name: cached_provenance_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cached_provenance_logs_id_seq OWNED BY public.cached_provenance_logs.id;


--
-- TOC entry 254 (class 1259 OID 16721)
-- Name: disputes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.disputes (
    id integer NOT NULL,
    token_id character varying(255),
    claimant_id integer,
    description text,
    status character varying(50),
    created_at timestamp without time zone,
    resolved_at timestamp without time zone
);


ALTER TABLE public.disputes OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 16720)
-- Name: disputes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.disputes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.disputes_id_seq OWNER TO postgres;

--
-- TOC entry 5243 (class 0 OID 0)
-- Dependencies: 253
-- Name: disputes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.disputes_id_seq OWNED BY public.disputes.id;


--
-- TOC entry 258 (class 1259 OID 16756)
-- Name: fraud_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fraud_reports (
    id integer NOT NULL,
    reporter_id integer,
    token_id character varying(255),
    reason text,
    evidence_images text,
    status character varying(50),
    reviewed_by integer,
    created_at timestamp without time zone
);


ALTER TABLE public.fraud_reports OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 16755)
-- Name: fraud_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fraud_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fraud_reports_id_seq OWNER TO postgres;

--
-- TOC entry 5244 (class 0 OID 0)
-- Dependencies: 257
-- Name: fraud_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fraud_reports_id_seq OWNED BY public.fraud_reports.id;


--
-- TOC entry 242 (class 1259 OID 16569)
-- Name: land_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.land_files (
    id integer NOT NULL,
    record_id integer,
    file_name character varying(255),
    file_type character varying(50),
    ipfs_cid character varying(255),
    uploaded_by integer,
    created_at timestamp without time zone
);


ALTER TABLE public.land_files OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 16568)
-- Name: land_files_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.land_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.land_files_id_seq OWNER TO postgres;

--
-- TOC entry 5245 (class 0 OID 0)
-- Dependencies: 241
-- Name: land_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.land_files_id_seq OWNED BY public.land_files.id;


--
-- TOC entry 246 (class 1259 OID 16620)
-- Name: land_nfts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.land_nfts (
    token_id character varying(255) NOT NULL,
    record_id integer,
    contract_address character varying(255),
    owner_wallet character varying(255),
    metadata_uri character varying(500),
    qr_code character varying(255),
    mint_tx_hash character varying(255),
    status character varying(50),
    mint_date timestamp without time zone
);


ALTER TABLE public.land_nfts OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 16590)
-- Name: land_planning_map; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.land_planning_map (
    record_id integer NOT NULL,
    zone_id integer NOT NULL,
    status character varying(50)
);


ALTER TABLE public.land_planning_map OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 16549)
-- Name: land_record_versions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.land_record_versions (
    id integer NOT NULL,
    record_id integer,
    editor_id integer,
    old_area numeric(15,2),
    new_area numeric(15,2),
    old_gps_coordinates text,
    new_gps_coordinates text,
    edit_reason text,
    version_number integer,
    created_at timestamp without time zone
);


ALTER TABLE public.land_record_versions OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16548)
-- Name: land_record_versions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.land_record_versions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.land_record_versions_id_seq OWNER TO postgres;

--
-- TOC entry 5246 (class 0 OID 0)
-- Dependencies: 239
-- Name: land_record_versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.land_record_versions_id_seq OWNED BY public.land_record_versions.id;


--
-- TOC entry 232 (class 1259 OID 16482)
-- Name: land_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.land_records (
    id integer NOT NULL,
    owner_id integer,
    address text,
    area numeric(15,2),
    gps_coordinates text,
    is_frozen boolean DEFAULT false,
    status character varying(100),
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.land_records OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16481)
-- Name: land_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.land_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.land_records_id_seq OWNER TO postgres;

--
-- TOC entry 5247 (class 0 OID 0)
-- Dependencies: 231
-- Name: land_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.land_records_id_seq OWNED BY public.land_records.id;


--
-- TOC entry 256 (class 1259 OID 16741)
-- Name: mortgages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mortgages (
    id integer NOT NULL,
    token_id character varying(255),
    bank_name character varying(255),
    mortgage_amount numeric(20,2),
    status character varying(50),
    created_at timestamp without time zone,
    released_at timestamp without time zone
);


ALTER TABLE public.mortgages OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 16740)
-- Name: mortgages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mortgages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mortgages_id_seq OWNER TO postgres;

--
-- TOC entry 5248 (class 0 OID 0)
-- Dependencies: 255
-- Name: mortgages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mortgages_id_seq OWNED BY public.mortgages.id;


--
-- TOC entry 236 (class 1259 OID 16518)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    title character varying(255),
    content text,
    type character varying(50),
    is_read boolean DEFAULT false,
    created_at timestamp without time zone
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16517)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- TOC entry 5249 (class 0 OID 0)
-- Dependencies: 235
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 223 (class 1259 OID 16408)
-- Name: planning_zones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.planning_zones (
    id integer NOT NULL,
    zone_name character varying(255),
    description text,
    polygon_coordinates text,
    status character varying(50),
    updated_at timestamp without time zone
);


ALTER TABLE public.planning_zones OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16407)
-- Name: planning_zones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.planning_zones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.planning_zones_id_seq OWNER TO postgres;

--
-- TOC entry 5250 (class 0 OID 0)
-- Dependencies: 222
-- Name: planning_zones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.planning_zones_id_seq OWNED BY public.planning_zones.id;


--
-- TOC entry 262 (class 1259 OID 16794)
-- Name: receipts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.receipts (
    id integer NOT NULL,
    tax_id integer,
    payment_method character varying(100),
    blockchain_tx_hash character varying(255),
    paid_at timestamp without time zone
);


ALTER TABLE public.receipts OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 16793)
-- Name: receipts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.receipts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.receipts_id_seq OWNER TO postgres;

--
-- TOC entry 5251 (class 0 OID 0)
-- Dependencies: 261
-- Name: receipts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.receipts_id_seq OWNED BY public.receipts.id;


--
-- TOC entry 220 (class 1259 OID 16390)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    role_code character varying(50),
    role_name character varying(255),
    description text
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16389)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- TOC entry 5252 (class 0 OID 0)
-- Dependencies: 219
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 248 (class 1259 OID 16653)
-- Name: signatures; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.signatures (
    id integer NOT NULL,
    request_id integer,
    user_id integer,
    decision character varying(50),
    reason text,
    sign_tx_hash character varying(255),
    signed_at timestamp without time zone
);


ALTER TABLE public.signatures OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 16652)
-- Name: signatures_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.signatures_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.signatures_id_seq OWNER TO postgres;

--
-- TOC entry 5253 (class 0 OID 0)
-- Dependencies: 247
-- Name: signatures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.signatures_id_seq OWNED BY public.signatures.id;


--
-- TOC entry 221 (class 1259 OID 16399)
-- Name: smart_contracts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.smart_contracts (
    contract_address character varying(255) NOT NULL,
    name character varying(255),
    abi text,
    version character varying(50),
    status character varying(50),
    deployed_at timestamp without time zone
);


ALTER TABLE public.smart_contracts OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16498)
-- Name: system_config_audits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_config_audits (
    id integer NOT NULL,
    config_key character varying(255),
    editor_id integer,
    old_value character varying(255),
    new_value character varying(255),
    changed_at timestamp without time zone
);


ALTER TABLE public.system_config_audits OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16497)
-- Name: system_config_audits_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.system_config_audits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_config_audits_id_seq OWNER TO postgres;

--
-- TOC entry 5254 (class 0 OID 0)
-- Dependencies: 233
-- Name: system_config_audits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.system_config_audits_id_seq OWNED BY public.system_config_audits.id;


--
-- TOC entry 224 (class 1259 OID 16417)
-- Name: system_configs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_configs (
    config_key character varying(255) NOT NULL,
    config_value character varying(255),
    description text,
    updated_at timestamp without time zone
);


ALTER TABLE public.system_configs OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 16534)
-- Name: system_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_logs (
    id integer NOT NULL,
    user_id integer,
    action character varying(100),
    target_table character varying(100),
    target_id character varying(100),
    hash_value character varying(255),
    ip_address character varying(50),
    created_at timestamp without time zone
);


ALTER TABLE public.system_logs OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16533)
-- Name: system_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.system_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5255 (class 0 OID 0)
-- Dependencies: 237
-- Name: system_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.system_logs_id_seq OWNED BY public.system_logs.id;


--
-- TOC entry 260 (class 1259 OID 16781)
-- Name: taxes_fees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.taxes_fees (
    id integer NOT NULL,
    transaction_id integer,
    tax_type character varying(100),
    amount numeric(20,2),
    status character varying(50),
    calculated_at timestamp without time zone
);


ALTER TABLE public.taxes_fees OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 16780)
-- Name: taxes_fees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.taxes_fees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.taxes_fees_id_seq OWNER TO postgres;

--
-- TOC entry 5256 (class 0 OID 0)
-- Dependencies: 259
-- Name: taxes_fees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.taxes_fees_id_seq OWNED BY public.taxes_fees.id;


--
-- TOC entry 252 (class 1259 OID 16693)
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    token_id character varying(255),
    seller_id integer,
    buyer_id integer,
    certifier_id integer,
    contract_price numeric(20,2),
    status character varying(50),
    created_at timestamp without time zone,
    completed_at timestamp without time zone
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 16692)
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transactions_id_seq OWNER TO postgres;

--
-- TOC entry 5257 (class 0 OID 0)
-- Dependencies: 251
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- TOC entry 227 (class 1259 OID 16432)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    role_id integer,
    vneid_number character varying(20),
    full_name character varying(255),
    email character varying(255),
    phone character varying(20),
    status character varying(50),
    created_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16431)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5258 (class 0 OID 0)
-- Dependencies: 226
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 230 (class 1259 OID 16462)
-- Name: wallet_recovery_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wallet_recovery_requests (
    id integer NOT NULL,
    user_id integer,
    old_wallet_address character varying(255),
    new_wallet_address character varying(255),
    status character varying(50),
    approved_by integer,
    created_at timestamp without time zone,
    resolved_at timestamp without time zone
);


ALTER TABLE public.wallet_recovery_requests OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16461)
-- Name: wallet_recovery_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wallet_recovery_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wallet_recovery_requests_id_seq OWNER TO postgres;

--
-- TOC entry 5259 (class 0 OID 0)
-- Dependencies: 229
-- Name: wallet_recovery_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wallet_recovery_requests_id_seq OWNED BY public.wallet_recovery_requests.id;


--
-- TOC entry 228 (class 1259 OID 16448)
-- Name: wallets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wallets (
    wallet_address character varying(255) NOT NULL,
    user_id integer,
    status character varying(50),
    created_at timestamp without time zone
);


ALTER TABLE public.wallets OWNER TO postgres;

--
-- TOC entry 4982 (class 2604 OID 16611)
-- Name: approval_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_requests ALTER COLUMN id SET DEFAULT nextval('public.approval_requests_id_seq'::regclass);


--
-- TOC entry 4984 (class 2604 OID 16676)
-- Name: cached_provenance_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cached_provenance_logs ALTER COLUMN id SET DEFAULT nextval('public.cached_provenance_logs_id_seq'::regclass);


--
-- TOC entry 4986 (class 2604 OID 16724)
-- Name: disputes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disputes ALTER COLUMN id SET DEFAULT nextval('public.disputes_id_seq'::regclass);


--
-- TOC entry 4988 (class 2604 OID 16759)
-- Name: fraud_reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fraud_reports ALTER COLUMN id SET DEFAULT nextval('public.fraud_reports_id_seq'::regclass);


--
-- TOC entry 4981 (class 2604 OID 16572)
-- Name: land_files id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.land_files ALTER COLUMN id SET DEFAULT nextval('public.land_files_id_seq'::regclass);


--
-- TOC entry 4980 (class 2604 OID 16552)
-- Name: land_record_versions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.land_record_versions ALTER COLUMN id SET DEFAULT nextval('public.land_record_versions_id_seq'::regclass);


--
-- TOC entry 4974 (class 2604 OID 16485)
-- Name: land_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.land_records ALTER COLUMN id SET DEFAULT nextval('public.land_records_id_seq'::regclass);


--
-- TOC entry 4987 (class 2604 OID 16744)
-- Name: mortgages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mortgages ALTER COLUMN id SET DEFAULT nextval('public.mortgages_id_seq'::regclass);


--
-- TOC entry 4977 (class 2604 OID 16521)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 4971 (class 2604 OID 16411)
-- Name: planning_zones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planning_zones ALTER COLUMN id SET DEFAULT nextval('public.planning_zones_id_seq'::regclass);


--
-- TOC entry 4990 (class 2604 OID 16797)
-- Name: receipts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipts ALTER COLUMN id SET DEFAULT nextval('public.receipts_id_seq'::regclass);


--
-- TOC entry 4970 (class 2604 OID 16393)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 4983 (class 2604 OID 16656)
-- Name: signatures id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signatures ALTER COLUMN id SET DEFAULT nextval('public.signatures_id_seq'::regclass);


--
-- TOC entry 4976 (class 2604 OID 16501)
-- Name: system_config_audits id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_config_audits ALTER COLUMN id SET DEFAULT nextval('public.system_config_audits_id_seq'::regclass);


--
-- TOC entry 4979 (class 2604 OID 16537)
-- Name: system_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs ALTER COLUMN id SET DEFAULT nextval('public.system_logs_id_seq'::regclass);


--
-- TOC entry 4989 (class 2604 OID 16784)
-- Name: taxes_fees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taxes_fees ALTER COLUMN id SET DEFAULT nextval('public.taxes_fees_id_seq'::regclass);


--
-- TOC entry 4985 (class 2604 OID 16696)
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- TOC entry 4972 (class 2604 OID 16435)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4973 (class 2604 OID 16465)
-- Name: wallet_recovery_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_recovery_requests ALTER COLUMN id SET DEFAULT nextval('public.wallet_recovery_requests_id_seq'::regclass);


--
-- TOC entry 5028 (class 2606 OID 16614)
-- Name: approval_requests approval_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_requests
    ADD CONSTRAINT approval_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 5000 (class 2606 OID 16430)
-- Name: blockchain_logs blockchain_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blockchain_logs
    ADD CONSTRAINT blockchain_logs_pkey PRIMARY KEY (tx_hash);


--
-- TOC entry 5038 (class 2606 OID 16681)
-- Name: cached_provenance_logs cached_provenance_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cached_provenance_logs
    ADD CONSTRAINT cached_provenance_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5042 (class 2606 OID 16729)
-- Name: disputes disputes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_pkey PRIMARY KEY (id);


--
-- TOC entry 5046 (class 2606 OID 16764)
-- Name: fraud_reports fraud_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fraud_reports
    ADD CONSTRAINT fraud_reports_pkey PRIMARY KEY (id);


--
-- TOC entry 5022 (class 2606 OID 16579)
-- Name: land_files land_files_ipfs_cid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.land_files
    ADD CONSTRAINT land_files_ipfs_cid_key UNIQUE (ipfs_cid);


--
-- TOC entry 5024 (class 2606 OID 16577)
-- Name: land_files land_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.land_files
    ADD CONSTRAINT land_files_pkey PRIMARY KEY (id);


--
-- TOC entry 5030 (class 2606 OID 16627)
-- Name: land_nfts land_nfts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.land_nfts
    ADD CONSTRAINT land_nfts_pkey PRIMARY KEY (token_id);


--
-- TOC entry 5032 (class 2606 OID 16631)
-- Name: land_nfts land_nfts_qr_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.land_nfts
    ADD CONSTRAINT land_nfts_qr_code_key UNIQUE (qr_code);


--
-- TOC entry 5034 (class 2606 OID 16629)
-- Name: land_nfts land_nfts_record_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.land_nfts
    ADD CONSTRAINT land_nfts_record_id_key UNIQUE (record_id);


--
-- TOC entry 5026 (class 2606 OID 16596)
-- Name: land_planning_map land_planning_map_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.land_planning_map
    ADD CONSTRAINT land_planning_map_pkey PRIMARY KEY (record_id, zone_id);


--
-- TOC entry 5020 (class 2606 OID 16557)
-- Name: land_record_versions land_record_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.land_record_versions
    ADD CONSTRAINT land_record_versions_pkey PRIMARY KEY (id);


--
-- TOC entry 5012 (class 2606 OID 16491)
-- Name: land_records land_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.land_records
    ADD CONSTRAINT land_records_pkey PRIMARY KEY (id);


--
-- TOC entry 5044 (class 2606 OID 16749)
-- Name: mortgages mortgages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mortgages
    ADD CONSTRAINT mortgages_pkey PRIMARY KEY (id);


--
-- TOC entry 5016 (class 2606 OID 16527)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4996 (class 2606 OID 16416)
-- Name: planning_zones planning_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planning_zones
    ADD CONSTRAINT planning_zones_pkey PRIMARY KEY (id);


--
-- TOC entry 5050 (class 2606 OID 16800)
-- Name: receipts receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_pkey PRIMARY KEY (id);


--
-- TOC entry 5052 (class 2606 OID 16802)
-- Name: receipts receipts_tax_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_tax_id_key UNIQUE (tax_id);


--
-- TOC entry 4992 (class 2606 OID 16398)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 5036 (class 2606 OID 16661)
-- Name: signatures signatures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT signatures_pkey PRIMARY KEY (id);


--
-- TOC entry 4994 (class 2606 OID 16406)
-- Name: smart_contracts smart_contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.smart_contracts
    ADD CONSTRAINT smart_contracts_pkey PRIMARY KEY (contract_address);


--
-- TOC entry 5014 (class 2606 OID 16506)
-- Name: system_config_audits system_config_audits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_config_audits
    ADD CONSTRAINT system_config_audits_pkey PRIMARY KEY (id);


--
-- TOC entry 4998 (class 2606 OID 16424)
-- Name: system_configs system_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_configs
    ADD CONSTRAINT system_configs_pkey PRIMARY KEY (config_key);


--
-- TOC entry 5018 (class 2606 OID 16542)
-- Name: system_logs system_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5048 (class 2606 OID 16787)
-- Name: taxes_fees taxes_fees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taxes_fees
    ADD CONSTRAINT taxes_fees_pkey PRIMARY KEY (id);


--
-- TOC entry 5040 (class 2606 OID 16699)
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 5002 (class 2606 OID 16440)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5004 (class 2606 OID 16442)
-- Name: users users_vneid_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_vneid_number_key UNIQUE (vneid_number);


--
-- TOC entry 5010 (class 2606 OID 16470)
-- Name: wallet_recovery_requests wallet_recovery_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_recovery_requests
    ADD CONSTRAINT wallet_recovery_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 5006 (class 2606 OID 16453)
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (wallet_address);


--
-- TOC entry 5008 (class 2606 OID 16455)
-- Name: wallets wallets_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_key UNIQUE (user_id);


--
-- TOC entry 5068 (class 2606 OID 16615)
-- Name: approval_requests approval_requests_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_requests
    ADD CONSTRAINT approval_requests_record_id_fkey FOREIGN KEY (record_id) REFERENCES public.land_records(id);


--
-- TOC entry 5075 (class 2606 OID 16682)
-- Name: cached_provenance_logs cached_provenance_logs_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cached_provenance_logs
    ADD CONSTRAINT cached_provenance_logs_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.land_nfts(token_id);


--
-- TOC entry 5076 (class 2606 OID 16687)
-- Name: cached_provenance_logs cached_provenance_logs_tx_hash_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cached_provenance_logs
    ADD CONSTRAINT cached_provenance_logs_tx_hash_fkey FOREIGN KEY (tx_hash) REFERENCES public.blockchain_logs(tx_hash);


--
-- TOC entry 5081 (class 2606 OID 16735)
-- Name: disputes disputes_claimant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_claimant_id_fkey FOREIGN KEY (claimant_id) REFERENCES public.users(id);


--
-- TOC entry 5082 (class 2606 OID 16730)
-- Name: disputes disputes_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.land_nfts(token_id);


--
-- TOC entry 5084 (class 2606 OID 16765)
-- Name: fraud_reports fraud_reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fraud_reports
    ADD CONSTRAINT fraud_reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id);


--
-- TOC entry 5085 (class 2606 OID 16775)
-- Name: fraud_reports fraud_reports_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fraud_reports
    ADD CONSTRAINT fraud_reports_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- TOC entry 5086 (class 2606 OID 16770)
-- Name: fraud_reports fraud_reports_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fraud_reports
    ADD CONSTRAINT fraud_reports_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.land_nfts(token_id);


--
-- TOC entry 5064 (class 2606 OID 16580)
-- Name: land_files land_files_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.land_files
    ADD CONSTRAINT land_files_record_id_fkey FOREIGN KEY (record_id) REFERENCES public.land_records(id);


--
-- TOC entry 5065 (class 2606 OID 16585)
-- Name: land_files land_files_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.land_files
    ADD CONSTRAINT land_files_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- TOC entry 5069 (class 2606 OID 16637)
-- Name: land_nfts land_nfts_contract_address_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.land_nfts
    ADD CONSTRAINT land_nfts_contract_address_fkey FOREIGN KEY (contract_address) REFERENCES public.smart_contracts(contract_address);


--
-- TOC entry 5070 (class 2606 OID 16647)
-- Name: land_nfts land_nfts_mint_tx_hash_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.land_nfts
    ADD CONSTRAINT land_nfts_mint_tx_hash_fkey FOREIGN KEY (mint_tx_hash) REFERENCES public.blockchain_logs(tx_hash);


--
-- TOC entry 5071 (class 2606 OID 16642)
-- Name: land_nfts land_nfts_owner_wallet_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.land_nfts
    ADD CONSTRAINT land_nfts_owner_wallet_fkey FOREIGN KEY (owner_wallet) REFERENCES public.wallets(wallet_address);


--
-- TOC entry 5072 (class 2606 OID 16632)
-- Name: land_nfts land_nfts_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.land_nfts
    ADD CONSTRAINT land_nfts_record_id_fkey FOREIGN KEY (record_id) REFERENCES public.land_records(id);


--
-- TOC entry 5066 (class 2606 OID 16597)
-- Name: land_planning_map land_planning_map_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.land_planning_map
    ADD CONSTRAINT land_planning_map_record_id_fkey FOREIGN KEY (record_id) REFERENCES public.land_records(id);


--
-- TOC entry 5067 (class 2606 OID 16602)
-- Name: land_planning_map land_planning_map_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.land_planning_map
    ADD CONSTRAINT land_planning_map_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.planning_zones(id);


--
-- TOC entry 5062 (class 2606 OID 16563)
-- Name: land_record_versions land_record_versions_editor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.land_record_versions
    ADD CONSTRAINT land_record_versions_editor_id_fkey FOREIGN KEY (editor_id) REFERENCES public.users(id);


--
-- TOC entry 5063 (class 2606 OID 16558)
-- Name: land_record_versions land_record_versions_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.land_record_versions
    ADD CONSTRAINT land_record_versions_record_id_fkey FOREIGN KEY (record_id) REFERENCES public.land_records(id);


--
-- TOC entry 5057 (class 2606 OID 16492)
-- Name: land_records land_records_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.land_records
    ADD CONSTRAINT land_records_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- TOC entry 5083 (class 2606 OID 16750)
-- Name: mortgages mortgages_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mortgages
    ADD CONSTRAINT mortgages_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.land_nfts(token_id);


--
-- TOC entry 5060 (class 2606 OID 16528)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5088 (class 2606 OID 16803)
-- Name: receipts receipts_tax_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_tax_id_fkey FOREIGN KEY (tax_id) REFERENCES public.taxes_fees(id);


--
-- TOC entry 5073 (class 2606 OID 16662)
-- Name: signatures signatures_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT signatures_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.approval_requests(id);


--
-- TOC entry 5074 (class 2606 OID 16667)
-- Name: signatures signatures_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT signatures_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5058 (class 2606 OID 16507)
-- Name: system_config_audits system_config_audits_config_key_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_config_audits
    ADD CONSTRAINT system_config_audits_config_key_fkey FOREIGN KEY (config_key) REFERENCES public.system_configs(config_key);


--
-- TOC entry 5059 (class 2606 OID 16512)
-- Name: system_config_audits system_config_audits_editor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_config_audits
    ADD CONSTRAINT system_config_audits_editor_id_fkey FOREIGN KEY (editor_id) REFERENCES public.users(id);


--
-- TOC entry 5061 (class 2606 OID 16543)
-- Name: system_logs system_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5087 (class 2606 OID 16788)
-- Name: taxes_fees taxes_fees_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.taxes_fees
    ADD CONSTRAINT taxes_fees_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id);


--
-- TOC entry 5077 (class 2606 OID 16710)
-- Name: transactions transactions_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id);


--
-- TOC entry 5078 (class 2606 OID 16715)
-- Name: transactions transactions_certifier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_certifier_id_fkey FOREIGN KEY (certifier_id) REFERENCES public.users(id);


--
-- TOC entry 5079 (class 2606 OID 16705)
-- Name: transactions transactions_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id);


--
-- TOC entry 5080 (class 2606 OID 16700)
-- Name: transactions transactions_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.land_nfts(token_id);


--
-- TOC entry 5053 (class 2606 OID 16443)
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- TOC entry 5055 (class 2606 OID 16476)
-- Name: wallet_recovery_requests wallet_recovery_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_recovery_requests
    ADD CONSTRAINT wallet_recovery_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- TOC entry 5056 (class 2606 OID 16471)
-- Name: wallet_recovery_requests wallet_recovery_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_recovery_requests
    ADD CONSTRAINT wallet_recovery_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5054 (class 2606 OID 16456)
-- Name: wallets wallets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


-- Completed on 2026-04-27 14:09:43

--
-- PostgreSQL database dump complete
--

\unrestrict xmNqdF4oIM7L4WolZrxTdvGXbl8TfV65ewt0un9DrUHHNK7ZrL8E1xdPdLEylEk

