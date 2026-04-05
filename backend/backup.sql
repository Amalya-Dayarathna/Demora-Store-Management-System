--
-- PostgreSQL database dump
--

\restrict GLck5ZN7XUuHc6SX39jZAhUGdm1PuDmdIFRSGdVzdXHaD0Hn3cDigQZbfr158Ke

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

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
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: bill_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bill_items (
    id text NOT NULL,
    "billId" text NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" double precision NOT NULL,
    total double precision NOT NULL,
    "itemId" text,
    "variantId" text
);


ALTER TABLE public.bill_items OWNER TO postgres;

--
-- Name: bills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bills (
    id text NOT NULL,
    "billNumber" text NOT NULL,
    subtotal double precision NOT NULL,
    "codDelivery" double precision DEFAULT 0 NOT NULL,
    "grandTotal" double precision NOT NULL,
    status text DEFAULT 'Ordered'::text NOT NULL,
    "customerName" text,
    "customerPhone" text,
    "customerAddress" text,
    "businessId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "packagingCost" double precision DEFAULT 0 NOT NULL,
    "paymentStatus" text DEFAULT 'Pending'::text NOT NULL,
    "paymentType" text DEFAULT 'COD'::text NOT NULL,
    "customerPhone2" text,
    "orderId" text,
    "trackingId" text
);


ALTER TABLE public.bills OWNER TO postgres;

--
-- Name: businesses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.businesses (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    status text DEFAULT 'active'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    color text DEFAULT '#000000'::text NOT NULL
);


ALTER TABLE public.businesses OWNER TO postgres;

--
-- Name: capital; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.capital (
    id text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    amount double precision NOT NULL,
    "givenBy" text NOT NULL,
    settled double precision DEFAULT 0 NOT NULL,
    "businessId" text NOT NULL,
    description text,
    type text DEFAULT 'investment'::text NOT NULL
);


ALTER TABLE public.capital OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id text NOT NULL,
    "categoryName" text NOT NULL,
    "categoryCode" text NOT NULL,
    "businessId" text NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    amount double precision NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    "businessId" text NOT NULL
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- Name: gift_box_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gift_box_items (
    id text NOT NULL,
    "giftBoxId" text NOT NULL,
    "itemId" text NOT NULL,
    quantity integer NOT NULL
);


ALTER TABLE public.gift_box_items OWNER TO postgres;

--
-- Name: gift_boxes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gift_boxes (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "packingCost" double precision DEFAULT 0 NOT NULL,
    "totalCost" double precision NOT NULL,
    "businessId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "giftBoxCode" text NOT NULL,
    "sellingPrice" double precision DEFAULT 0 NOT NULL
);


ALTER TABLE public.gift_boxes OWNER TO postgres;

--
-- Name: income; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.income (
    id text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    amount double precision NOT NULL,
    description text NOT NULL,
    source text DEFAULT 'manual'::text NOT NULL,
    "businessId" text NOT NULL
);


ALTER TABLE public.income OWNER TO postgres;

--
-- Name: items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items (
    id text NOT NULL,
    "itemName" text NOT NULL,
    "categoryId" text NOT NULL,
    "baseRefCode" text NOT NULL,
    "costPrice" double precision NOT NULL,
    "sellingPrice" double precision NOT NULL,
    "businessId" text NOT NULL,
    "costPriceCode" text DEFAULT 'DDD'::text NOT NULL,
    "stockQuantity" integer DEFAULT 0 NOT NULL,
    variants jsonb,
    tags jsonb,
    images jsonb
);


ALTER TABLE public.items OWNER TO postgres;

--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_movements (
    id text NOT NULL,
    "itemId" text,
    "movementType" text NOT NULL,
    quantity integer NOT NULL,
    reason text NOT NULL,
    reference text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "businessId" text NOT NULL,
    "variantId" text
);


ALTER TABLE public.stock_movements OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'admin'::text NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.variants (
    id text NOT NULL,
    "itemId" text NOT NULL,
    "variantCode" text NOT NULL,
    attributes jsonb NOT NULL,
    "stockQuantity" integer DEFAULT 0 NOT NULL,
    "qrCodeValue" text NOT NULL,
    "businessId" text NOT NULL
);


ALTER TABLE public.variants OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
5dfc2fc2-2f8a-4feb-908b-10860e810ed0	94326aade390212cbc66745f011d1e4b3b8ce18a9d50e0a783ca2969d291a5ea	2026-01-10 12:17:32.450458+05:30	20260110064732_npm_run_dev	\N	\N	2026-01-10 12:17:32.433653+05:30	1
a5e904fc-480c-4948-ac2c-c3cc06fcc55c	a2c8ed47337389527acaf99439e757dd3cfc8b8726bd3053abf67def46a7bc05	2026-01-10 13:08:19.404103+05:30	20260110073819_add_business_color	\N	\N	2026-01-10 13:08:19.402437+05:30	1
bdc80f1c-ebd4-415f-b918-1e47bd01898d	e721292003a15d16ee0e2e01b8e2283e195d72833bc0ef82d993e3b02ab22ad0	\N	20260209135322_integrate_variants_into_items	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260209135322_integrate_variants_into_items\n\nDatabase error code: 23502\n\nDatabase error:\nERROR: column "itemId" of relation "stock_movements" contains null values\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E23502), message: "column \\"itemId\\" of relation \\"stock_movements\\" contains null values", detail: None, hint: None, position: None, where_: None, schema: Some("public"), table: Some("stock_movements"), column: Some("itemId"), datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(6451), routine: Some("ATRewriteTable") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260209135322_integrate_variants_into_items"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name="20260209135322_integrate_variants_into_items"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:226	2026-02-09 13:54:42.072337+05:30	2026-02-09 13:54:11.518365+05:30	0
84d6ce54-d8d9-48c8-95b3-58f9f72a909b	05ef457ad8df2c45416086e5f9c596eaaf97a585475e95c10cb089e7b8e4bb90	2026-01-10 15:04:57.554165+05:30	20260110093457_add_cost_price_code_with_default	\N	\N	2026-01-10 15:04:57.552751+05:30	1
1614fcc2-b92e-46c5-b69e-b7bc3a1cceef	f24730d6ffdca258933776b24420ec2638f87ad6c9375b2e3442d6df7aff722f	2026-01-10 15:18:00.136562+05:30	20260110094800_add_packaging_cost	\N	\N	2026-01-10 15:18:00.134776+05:30	1
5678d9e8-c4a3-44fb-911d-3f42db75f8c4	d6b55a850ea357530ce10cfeb58679e63a848e6be4b60577b3e0c0730a98d1d5	2026-01-10 15:36:27.766354+05:30	20260110100627_add_item_stock_quantity	\N	\N	2026-01-10 15:36:27.764514+05:30	1
10082c98-5a50-4d01-bcde-fe4e0b3b22e8	34b8cc6e3407c59d372ced80b83b4d0c68706f2ff76409e6eaf917de84c0f9f4	2026-02-09 13:56:01.307801+05:30	20260209135322_integrate_variants_into_items	\N	\N	2026-02-09 13:56:01.302111+05:30	1
2b9cba09-1113-4739-874d-30856423232b	9da0616b09225abecea2bda51e961d76b1b2df453eaa81bb32815791c470f07c	2026-01-10 17:38:05.828654+05:30	20260110120805_add_item_billing_support	\N	\N	2026-01-10 17:38:05.82541+05:30	1
670e75d2-be1d-4b89-99ea-ed4cb36540de	0b2dc68f462d9b89de919bf9b86625f016379c665a075a78043a1fc8b338b6a2	2026-01-10 17:50:53.690398+05:30	20260110122053_add_stock_movements	\N	\N	2026-01-10 17:50:53.686769+05:30	1
ab56efad-573b-4fe1-acf6-caa965176231	4cf65a4b75c562b948dc31eb87be705d202b5b2ffcc243046fb9c95a99130752	2026-01-18 11:23:38.165411+05:30	20260118055338_add_gift_boxes	\N	\N	2026-01-18 11:23:38.156465+05:30	1
b2d9c491-8efe-492d-8189-a8b0b4c47785	8d4b395013b5b9efb79652a894ccc688e94cf8b285c4cb3f39a0780a946fad8d	\N	20260209135322_integrate_variants_into_items	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260209135322_integrate_variants_into_items\n\nDatabase error code: 23502\n\nDatabase error:\nERROR: column "itemId" of relation "stock_movements" contains null values\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E23502), message: "column \\"itemId\\" of relation \\"stock_movements\\" contains null values", detail: None, hint: None, position: None, where_: None, schema: Some("public"), table: Some("stock_movements"), column: Some("itemId"), datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(6451), routine: Some("ATRewriteTable") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260209135322_integrate_variants_into_items"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name="20260209135322_integrate_variants_into_items"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:226	2026-02-09 13:54:04.682002+05:30	2026-02-09 13:53:44.520462+05:30	0
\.


--
-- Data for Name: bill_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bill_items (id, "billId", quantity, "unitPrice", total, "itemId", "variantId") FROM stdin;
cmkthbaay0004lcyi93brhwru	cmkthbaat0002lcyirttulnkd	1	100	100	cmk85rj69000716fdanpfqqko	\N
cmkthbab40008lcyiwjsdw5t4	cmkthbaat0002lcyirttulnkd	1	160	160	cmki85quf0038n2bndwymzx6h	\N
cmkthbab6000clcyilukt6lj6	cmkthbaat0002lcyirttulnkd	1	200	200	cmki82aqs0034n2bn2lstalzf	\N
cmkthbab7000glcyinqrjk1b3	cmkthbaat0002lcyirttulnkd	1	150	150	cmki7pyxp002pn2bney09yx31	\N
cmkthbab9000klcyihedxt7a7	cmkthbaat0002lcyirttulnkd	1	200	200	cmk85vsyd000b16fd4k0w7es5	\N
cmkthbabb000olcyic2melj9j	cmkthbaat0002lcyirttulnkd	1	80	80	cmki86mhk003cn2bn09l3bmvz	\N
cmm083u430004ulhebwem63zp	cmm083u3y0002ulhe6vb820x3	1	125	125	cmk865ijm000d16fdf3n8z3pr	\N
cmnexwbo600042krqtgs3spol	cmnexwbnz00022krqmnpdfof2	1	6100	6100	cmn8tvxqu000h5n8k4ycqb6bu	\N
cmney4ovs000d2krqrh32irm8	cmney4ovm000b2krq3hkxbt0e	1	6100	6100	cmn8tvxqu000h5n8k4ycqb6bu	\N
\.


--
-- Data for Name: bills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bills (id, "billNumber", subtotal, "codDelivery", "grandTotal", status, "customerName", "customerPhone", "customerAddress", "businessId", "createdAt", "packagingCost", "paymentStatus", "paymentType", "customerPhone2", "orderId", "trackingId") FROM stdin;
cmkthbaat0002lcyirttulnkd	BILL-1769329855966-1	890	0	990	Delivered	Yasuri from Amma			cmk7z81uc0000h9h1ifjz33vf	2026-01-25 08:30:55.972	100	Received	COD	\N	\N	\N
cmm083u3y0002ulhe6vb820x3	BILL-1771914437420-2	125	0	125	Delivered	Amma			cmk7z81uc0000h9h1ifjz33vf	2026-02-24 06:27:17.423	0	Received	COD	\N	\N	\N
cmney4ovm000b2krq3hkxbt0e	BILL-1774981456099-2	6100	350	6450	Delivered	Nilmini Benedict	0773171787	8A,Postmaster's Place,Off Templar's Road,Mount Lavinia	cmk7zelbv0001h9h1i9e7lb3u	2026-03-31 18:24:16.114	0	Received	Bank Transfer	0112722140	2026/02	8163321
cmnexwbnz00022krqmnpdfof2	BILL-1774981065738-1	6100	350	6450	Delivered	Tharindra Jayathilake	0772335015	67,Temple Road,Maharagama	cmk7zelbv0001h9h1i9e7lb3u	2026-03-31 18:17:45.743	0	Pending	COD	0752264268	2026/01	CCP8163320
\.


--
-- Data for Name: businesses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.businesses (id, name, description, status, "createdAt", color) FROM stdin;
cmk7z81uc0000h9h1ifjz33vf	Lilac Store	Online Gift Boxes	active	2026-01-10 07:21:22.226	#b18cfe
cmk7zelbv0001h9h1i9e7lb3u	Demora	Online Luxuries Store and T shirt Brand	active	2026-01-10 07:26:27.451	#000000
cmk8dhyhh0012a37hljxedggz	Midnight Thoughts	Facebook Page for UK,US	active	2026-01-10 14:00:59.062	#1a0a53
\.


--
-- Data for Name: capital; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.capital (id, date, amount, "givenBy", settled, "businessId", description, type) FROM stdin;
cmk8bz5ul0007vy4czkxmvijl	2026-01-10 13:18:22.556	7460	Amalya	0	cmk7z81uc0000h9h1ifjz33vf	\N	investment
cmk8c2cxg000dvy4cbced9r2i	2026-01-10 13:20:51.699	12000	Amalya	0	cmk7z81uc0000h9h1ifjz33vf	\N	investment
cmk8cnhw3000aa37hjcn4ahme	2026-01-10 13:37:17.906	25855	Amma	0	cmk7z81uc0000h9h1ifjz33vf	\N	investment
cmk8c2nup000fvy4cqgsruqu9	2026-01-10 13:21:05.82	7500	Thaththa	7500	cmk7z81uc0000h9h1ifjz33vf	\N	investment
cmk8d1nzu000na37hvhepbpny	2026-01-10 13:48:19.001	10000	Nihal Mama	0	cmk7z81uc0000h9h1ifjz33vf	\N	investment
cmk8d8mdg000pa37h20ddegnw	2026-01-10 13:53:43.491	42928.25	Amalya	0	cmk7zelbv0001h9h1i9e7lb3u	\N	investment
cmk8bw1a20001vy4c15izk115	2026-01-10 13:15:56.628	4000	Amalya	4000	cmk7z81uc0000h9h1ifjz33vf	\N	investment
cmkkxs36900015tdtrc466s8m	2026-01-10 13:29:24.112	-5000	Unknown	0	cmk7z81uc0000h9h1ifjz33vf	Capital settled to Thaththa	settlement
cmkkxs36b00035tdtly82e1kt	2026-01-10 13:30:34.449	-2250	Unknown	0	cmk7z81uc0000h9h1ifjz33vf	Capital settled to Amalya	settlement
cmkkxs36c00055tdtw1cs2mtf	2026-01-10 13:41:03.826	-2500	Unknown	0	cmk7z81uc0000h9h1ifjz33vf	Capital settled to Thaththa	settlement
cmkkxs36d00075tdtz4xt12ah	2026-01-19 08:44:57.691	-1000	Amalya	0	cmk7z81uc0000h9h1ifjz33vf	Capital settlement to Amalya	settlement
cmkkyd9kd0001dv70jjcidmk2	2026-01-19 09:18:26.222	-500	Amalya	0	cmk7z81uc0000h9h1ifjz33vf	Capital settlement to Amalya	settlement
cmk8cp91d000ca37h8sov3ite	2026-01-10 13:38:39.707	13980	Amalya	1500	cmk7z81uc0000h9h1ifjz33vf	\N	investment
cml3vcbh8000x4kvoyv0xcir4	2026-02-01 15:01:20.538	2000	Amalya	0	cmk8dhyhh0012a37hljxedggz	\N	investment
cmlet6i2t0007oi8finaubau4	2026-02-09 06:46:17.86	4650	Amalya	0	cmk7zelbv0001h9h1i9e7lb3u	\N	investment
cmnez25tg000n2krqb34afhjs	2026-03-31 18:50:17.714	100000	Amalya	0	cmk7zelbv0001h9h1i9e7lb3u	\N	investment
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, "categoryName", "categoryCode", "businessId") FROM stdin;
cmk7ziylg0009h9h1w4nl4ks4	Bracelets	BR	cmk7z81uc0000h9h1ifjz33vf
cmk7zj9lv000bh9h1l22ems7a	Hair Clips	HC	cmk7z81uc0000h9h1ifjz33vf
cmk82sxx200032xwma96pclv4	Note Books	NB	cmk7z81uc0000h9h1ifjz33vf
cmk82xjd600052xwmamdfcrkv	Wool Bands	WB	cmk7z81uc0000h9h1ifjz33vf
cmk831sfn00092xwmktsx2tix	Comb	CB	cmk7z81uc0000h9h1ifjz33vf
cmk832ax4000d2xwm8iz1bq79	Water Bottles	WT	cmk7z81uc0000h9h1ifjz33vf
cmk832pba000f2xwmm0inr75p	Highlighters	HG	cmk7z81uc0000h9h1ifjz33vf
cmk832wzy000h2xwmsclcpvad	Erasers	ER	cmk7z81uc0000h9h1ifjz33vf
cmk83343k000j2xwm773n82gl	Cutters	CT	cmk7z81uc0000h9h1ifjz33vf
cmk833am1000l2xwm5l0q2z4u	Lunch Box	LB	cmk7z81uc0000h9h1ifjz33vf
cmk83jpiy000z2xwmw15v15zh	Tipex	TX	cmk7z81uc0000h9h1ifjz33vf
cmk843a320001k63u6hwf3q9u	Pens	PN	cmk7z81uc0000h9h1ifjz33vf
cmk84tdb40001jff4p5603e5i	Mathematics Box	MX	cmk7z81uc0000h9h1ifjz33vf
cmk84w5wt0008jff4nnqstghk	Platignum Set	PS	cmk7z81uc0000h9h1ifjz33vf
cmk8571zs0001124wxb25124q	Stickers	ST	cmk7z81uc0000h9h1ifjz33vf
cmk85bjin000116fd4h3ddtr1	Purse	PU	cmk7z81uc0000h9h1ifjz33vf
cmk86l2oi000h16fdo6h779yw	Key Tag	KT	cmk7z81uc0000h9h1ifjz33vf
cmk86pns3000l16fdkg8ilqg4	Sticky Notes	SN	cmk7z81uc0000h9h1ifjz33vf
cmk86snz1000p16fdbfzpwiw6	Pencil Box	PB	cmk7z81uc0000h9h1ifjz33vf
cmk871ser000t16fdfg1kcjxk	Rular	RL	cmk7z81uc0000h9h1ifjz33vf
cmk896tr80001zxpdx27evgvm	Pencil	PC	cmk7z81uc0000h9h1ifjz33vf
cmk8dennx000za37hhx7xv7ft	T Shirts	TS	cmk7zelbv0001h9h1i9e7lb3u
cmk8dewvm0011a37hbjgtr8kw	Kids T Shirts	KTS	cmk7zelbv0001h9h1i9e7lb3u
cmkhx7ua10008n2bnyktigqd7	Perfume 	PF	cmk7z81uc0000h9h1ifjz33vf
cmkhxnn9t000mn2bna4030fxb	Necklace	NC	cmk7z81uc0000h9h1ifjz33vf
cmkhy3jc90010n2bnpw0ogjt6	Watch	WC	cmk7z81uc0000h9h1ifjz33vf
cmkhyo07d0016n2bn1as6esbx	Head Bands	HB	cmk7z81uc0000h9h1ifjz33vf
cmki7avsn002cn2bnrcjk3x15	Slime	SL	cmk7z81uc0000h9h1ifjz33vf
cmki8b9o8003gn2bniswvtegv	Lip Liner	LL	cmk7z81uc0000h9h1ifjz33vf
cmki8uwkw0049n2bn6e6dsxk4	Phone Straps	PR	cmk7z81uc0000h9h1ifjz33vf
cmki8z89m004pn2bn4pyp39sd	Earrings	ES	cmk7z81uc0000h9h1ifjz33vf
cmkjbndnc0001ljb12esd41r2	Gift Boxed	GX	cmk7z81uc0000h9h1ifjz33vf
cmn8t4ckf00015n8kzb8znchz	Body Lotions	BL	cmk7zelbv0001h9h1i9e7lb3u
cmn8t51tv00035n8kapgjuzks	Body Sprays - Ladies	BSL	cmk7zelbv0001h9h1i9e7lb3u
cmn8t5gmx00055n8keb6cz1ia	Body Sprays - Gents	BSG	cmk7zelbv0001h9h1i9e7lb3u
cmn8t5u6y00075n8ka608s60r	Earrings	ER	cmk7zelbv0001h9h1i9e7lb3u
cmn8t698j00095n8kyvh8mls0	Bracelets	BR	cmk7zelbv0001h9h1i9e7lb3u
cmn8t6utx000b5n8kwazxlv5i	Hand Bags	HB	cmk7zelbv0001h9h1i9e7lb3u
cmn8tzby1000p5n8klko3vu7w	Pens	PN	cmk7zelbv0001h9h1i9e7lb3u
cmn8tzj66000r5n8ki7ij65h9	Key Tags	KT	cmk7zelbv0001h9h1i9e7lb3u
cmnez86u8000t2krqes9ohbjv	Purse	PR	cmk7zelbv0001h9h1i9e7lb3u
cmnlgxzgh000h4gg04v28ctna	Bangles	BN	cmk7zelbv0001h9h1i9e7lb3u
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, date, amount, description, category, "businessId") FROM stdin;
cmk8bwpl50003vy4c0n4498uu	2026-01-10 13:16:28.168	4000	2025 - Sale 1	supplies	cmk7z81uc0000h9h1ifjz33vf
cmk8c11v9000bvy4cbdh35eze	2026-01-10 13:19:50.708	16475	2025 - Sale 2	supplies	cmk7z81uc0000h9h1ifjz33vf
cmk8cli4f0006a37hbeey9fhn	2026-01-10 13:35:44.894	29706.26	2025 - Sales 3	supplies	cmk7z81uc0000h9h1ifjz33vf
cmk8cy12v000ha37h5dsdldhy	2026-01-10 13:45:29.334	61811.91	2025 - Sale 4	supplies	cmk7z81uc0000h9h1ifjz33vf
cmk8d9ucq000ra37h8432jl36	2026-01-10 13:54:40.489	14280	Plain kids t shirts	supplies	cmk7zelbv0001h9h1i9e7lb3u
cmk8da7iq000ta37hv4zy8gy4	2026-01-10 13:54:57.553	4200	DTF stickers	supplies	cmk7zelbv0001h9h1i9e7lb3u
cmk8dawuf000va37he1f4f5kg	2026-01-10 13:55:30.374	20801.65	Shein order - Singapore	supplies	cmk7zelbv0001h9h1i9e7lb3u
cmk8dbgy9000xa37hloic8dhb	2026-01-10 13:55:56.395	2126.6	Lazarda order - Singapore	supplies	cmk7zelbv0001h9h1i9e7lb3u
cml3v6zk600014kvowr75qydq	2026-02-01 14:57:11.81	1709.33	FB Add	ads	cmk7z81uc0000h9h1ifjz33vf
cmlenfmzf0001oi8fshj5m8hl	2026-02-09 04:05:26.426	3760	Drawers	other	cmk7z81uc0000h9h1ifjz33vf
cmlet703n0009oi8fjcjp399n	2026-02-09 06:46:41.218	4650	Demora.lk purchasing	utilities	cmk7zelbv0001h9h1i9e7lb3u
cmlgb2icm0001si97nqh1rnnn	2026-02-10 07:54:50.853	1773.64	Facebook Ads	ads	cmk7z81uc0000h9h1ifjz33vf
cmneye695000j2krqacj70dl9	2026-03-31 18:31:38.504	1815.09	Facebook Add 2026/03/30	ads	cmk7zelbv0001h9h1i9e7lb3u
cmnez3fhc000p2krq6m5ge8vd	2026-03-31 18:51:16.894	15250	Earrings	supplies	cmk7zelbv0001h9h1i9e7lb3u
cmnez478k000r2krqdyk79qel	2026-03-31 18:51:52.837	38700	Bath and Body Works	supplies	cmk7zelbv0001h9h1i9e7lb3u
cmneyxgxf000l2krq481rkvct	2026-03-31 18:46:38.803	20000	Shein Orders	supplies	cmk7zelbv0001h9h1i9e7lb3u
\.


--
-- Data for Name: gift_box_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gift_box_items (id, "giftBoxId", "itemId", quantity) FROM stdin;
cmkjd0q5j000c5kd7v068phei	cmkjcuryb000lk6x3biin9yqg	cmkhx9um2000an2bnj4reodqr	1
cmkjd0q5j000d5kd7vfhb2dxk	cmkjcuryb000lk6x3biin9yqg	cmki8vvzd004bn2bncg397yqg	1
cmkjd0q5j000e5kd7sb6xkxmv	cmkjcuryb000lk6x3biin9yqg	cmkhyvxch001gn2bnyvlf7fsq	1
cmkjd0q5j000f5kd7yport2ex	cmkjcuryb000lk6x3biin9yqg	cmki6ximp001sn2bnbmhtfpo9	1
cmkjd0q5j000g5kd7h5dsnynv	cmkjcuryb000lk6x3biin9yqg	cmk85jwp6000516fdaklp50fq	1
cmkjd0q5j000h5kd70slj3hiw	cmkjcuryb000lk6x3biin9yqg	cmki91tib004vn2bnfxiup92l	1
cmkjd0q5j000i5kd7tqgstzqp	cmkjcuryb000lk6x3biin9yqg	cmki92jc1004zn2bnyobhjttp	1
cml3v83jz00044kvo00vfluwa	cmkjc16m60001k6x3057nkz94	cmk85rj69000716fdanpfqqko	1
cml3v83jz00054kvovjh3vfx4	cmkjc16m60001k6x3057nkz94	cmki85quf0038n2bndwymzx6h	1
cml3v83jz00064kvo4rt6hofj	cmkjc16m60001k6x3057nkz94	cmki82aqs0034n2bn2lstalzf	1
cml3v83jz00074kvo0ff6h1kw	cmkjc16m60001k6x3057nkz94	cmki7pyxp002pn2bney09yx31	1
cml3v83jz00084kvo1l1er4qt	cmkjc16m60001k6x3057nkz94	cmk85vsyd000b16fd4k0w7es5	1
cml3v83jz00094kvo4fs8wvob	cmkjc16m60001k6x3057nkz94	cmki86mhk003cn2bn09l3bmvz	1
cml3v8ucm000c4kvojudqz5el	cmkjcq3qm000ak6x32iapvf3a	cmki6yept001wn2bn81x3ojm5	1
cml3v8ucm000d4kvoe2q4855i	cmkjcq3qm000ak6x32iapvf3a	cmki7pyxp002pn2bney09yx31	1
cml3v8ucm000e4kvom4h0bn87	cmkjcq3qm000ak6x32iapvf3a	cmki8tri2003yn2bn073w6352	1
cml3v8ucm000f4kvok4hhdlna	cmkjcq3qm000ak6x32iapvf3a	cmki8cn7c003in2bn614zluhd	1
cml3v8ucm000g4kvo1gg0qqgq	cmkjcq3qm000ak6x32iapvf3a	cmkhytohu001cn2bnnksy4dkl	1
cml3v8ucm000h4kvomi352o56	cmkjcq3qm000ak6x32iapvf3a	cmk865ijm000d16fdf3n8z3pr	1
cml3v8ucm000i4kvolcblkl8y	cmkjcq3qm000ak6x32iapvf3a	cmkhxjrvt000in2bnkzibzyeo	1
cml3v8ucm000j4kvo3n4a0k3w	cmkjcq3qm000ak6x32iapvf3a	cmki937hy0053n2bnihh5ryu0	1
cml3v9c2i000m4kvow4xjmdhe	cmkjfrbsf0001qvvhlp2eet5a	cmk834cx7000n2xwmn7jx0crw	1
cml3v9c2i000n4kvo64m0r6lz	cmkjfrbsf0001qvvhlp2eet5a	cmki7ae4n0028n2bn9lo3olvt	1
cml3v9c2i000o4kvo2z8q9x77	cmkjfrbsf0001qvvhlp2eet5a	cmk85904d0005124wa21tnhtf	1
cml3v9c2i000p4kvo5dh3li7l	cmkjfrbsf0001qvvhlp2eet5a	cmk86r5gb000n16fdp89i2702	1
cml3v9c2i000q4kvo4nx89u2t	cmkjfrbsf0001qvvhlp2eet5a	cmkhx2sf10004n2bnypcuot1e	2
cml3v9c2i000r4kvokb8jhhbr	cmkjfrbsf0001qvvhlp2eet5a	cmk84y5l4000bjff4csel847m	1
cml3v9c2i000s4kvoaal572y6	cmkjfrbsf0001qvvhlp2eet5a	cmk84tzl30004jff48gfu8cfd	1
cml3v9c2i000t4kvof6e93pcu	cmkjfrbsf0001qvvhlp2eet5a	cmk87h7ii0001qvqusv0ocyds	1
cml3v9c2i000u4kvokyjy651o	cmkjfrbsf0001qvvhlp2eet5a	cmk84is7v0001b76k5z28dug2	1
cml3v9c2i000v4kvot3pdqtc4	cmkjfrbsf0001qvvhlp2eet5a	cmki72kvv0020n2bnmvyquidi	1
cml5c1dcq0003slpvzs3xutyr	cml5c1dcq0001slpvxzih44bx	cmk82yhh700072xwmjb3b84y7	1
cml5c1dcq0004slpv0qfp4g3f	cml5c1dcq0001slpvxzih44bx	cmki6yept001wn2bn81x3ojm5	1
cml5c1dcq0005slpvqm3kinco	cml5c1dcq0001slpvxzih44bx	cmkhx9um2000an2bnj4reodqr	1
cml5c1dcq0006slpv9cnx2xxn	cml5c1dcq0001slpvxzih44bx	cmk85tely000916fdm07jrn21	1
cml5c1dcq0007slpvpu3cywsd	cml5c1dcq0001slpvxzih44bx	cmki85quf0038n2bndwymzx6h	1
cml5c1dcq0008slpvygz55jpt	cml5c1dcq0001slpvxzih44bx	cmki82aqs0034n2bn2lstalzf	1
cml5c1dcq0009slpvver6w0a4	cml5c1dcq0001slpvxzih44bx	cmki7pyxp002pn2bney09yx31	1
cml5c1dcq000aslpvdn6nokcn	cml5c1dcq0001slpvxzih44bx	cmk85vsyd000b16fd4k0w7es5	1
cml5c1dcq000bslpv8wi3yici	cml5c1dcq0001slpvxzih44bx	cmki8tri2003yn2bn073w6352	1
cml5c1dcq000cslpvsi57dg35	cml5c1dcq0001slpvxzih44bx	cmki8cn7c003in2bn614zluhd	1
cml5c1dcq000dslpviecs097w	cml5c1dcq0001slpvxzih44bx	cmkhytohu001cn2bnnksy4dkl	1
cml5c1dcq000eslpv4rvo77n3	cml5c1dcq0001slpvxzih44bx	cmk865ijm000d16fdf3n8z3pr	1
cml5c1dcq000fslpvxd3p824h	cml5c1dcq0001slpvxzih44bx	cmki937hy0053n2bnihh5ryu0	1
cml5c1dcq000gslpvu1zegr8f	cml5c1dcq0001slpvxzih44bx	cmki93t9v0057n2bnrye60muu	1
cml5c1dcq000hslpvwzzisd8i	cml5c1dcq0001slpvxzih44bx	cmk836icl000p2xwmxt3t8eal	1
cml5c1dcq000islpv15cbefnm	cml5c1dcq0001slpvxzih44bx	cmkhx2sf10004n2bnypcuot1e	2
cml5cco3p000mslpvztmrnxr9	cml5cco3p000kslpvl3lajlm3	cmki8vvzd004bn2bncg397yqg	1
cml5cco3p000nslpvqnh3qooa	cml5cco3p000kslpvl3lajlm3	cmkjcwano000vk6x3mf06diwu	1
cml5cco3p000oslpvsabcfndh	cml5cco3p000kslpvl3lajlm3	cmkhy5hq10012n2bngmzn8w2e	1
cml5cco3p000pslpv0kqcolfg	cml5cco3p000kslpvl3lajlm3	cmki90fw9004rn2bn4vh3iyun	1
cml5cco3p000qslpvyq4ozx1r	cml5cco3p000kslpvl3lajlm3	cmk85vsyd000b16fd4k0w7es5	1
cml5cco3p000rslpvdygrvi6i	cml5cco3p000kslpvl3lajlm3	cmki6ximp001sn2bnbmhtfpo9	1
cml5zy8gu000vslpv259ayryp	cml5zy8gu000tslpvjsvfwi9w	cmki7pyxp002pn2bney09yx31	1
cml5zy8gu000wslpvmrnjyksz	cml5zy8gu000tslpvjsvfwi9w	cmki8tri2003yn2bn073w6352	1
cml5zy8gu000xslpvxlvsxf7m	cml5zy8gu000tslpvjsvfwi9w	cmkhytohu001cn2bnnksy4dkl	1
cml5zy8gu000yslpvwaohfb5k	cml5zy8gu000tslpvjsvfwi9w	cmkhypyn00018n2bnbocygyyt	1
cml5zy8gu000zslpv8fuv26jv	cml5zy8gu000tslpvjsvfwi9w	cmki93t9v0057n2bnrye60muu	1
cml633w4r0003116erp85kvlw	cml633w4r0001116ek2yc70mn	cmki6yept001wn2bn81x3ojm5	1
cml633w4r0004116ecqel00ne	cml633w4r0001116ek2yc70mn	cmk82yhh700072xwmjb3b84y7	1
cml633w4r0005116e5p4l804l	cml633w4r0001116ek2yc70mn	cmk85vsyd000b16fd4k0w7es5	1
cml633w4r0006116e1spcrj2w	cml633w4r0001116ek2yc70mn	cmki7pyxp002pn2bney09yx31	1
cml633w4r0007116e2p4n1amy	cml633w4r0001116ek2yc70mn	cmki82aqs0034n2bn2lstalzf	1
cml633w4r0008116e9ys94uuq	cml633w4r0001116ek2yc70mn	cmki85quf0038n2bndwymzx6h	1
cml633w4r0009116e65eqalj2	cml633w4r0001116ek2yc70mn	cmk85tely000916fdm07jrn21	1
cml633w4r000a116ebku1mcrm	cml633w4r0001116ek2yc70mn	cmki8rv59003un2bnqz8xcjde	1
cml633w4r000b116egsmjwzsd	cml633w4r0001116ek2yc70mn	cmki8cn7c003in2bn614zluhd	1
cml633w4r000c116ene90rl89	cml633w4r0001116ek2yc70mn	cmkhytohu001cn2bnnksy4dkl	1
cml633w4r000d116ewzq668dh	cml633w4r0001116ek2yc70mn	cmkhx2sf10004n2bnypcuot1e	2
cml633w4r000e116ez1x04s0q	cml633w4r0001116ek2yc70mn	cmk865ijm000d16fdf3n8z3pr	1
cml633w4r000f116ey4kwq0lq	cml633w4r0001116ek2yc70mn	cmkhxjrvt000in2bnkzibzyeo	1
cml633w4r000g116e6yyrq6fi	cml633w4r0001116ek2yc70mn	cmki93t9v0057n2bnrye60muu	1
cml633w4r000h116ep2kuxkkp	cml633w4r0001116ek2yc70mn	cmki937hy0053n2bnihh5ryu0	1
cml633w4r000i116edaljs6rx	cml633w4r0001116ek2yc70mn	cmki8ivpw003qn2bnj73zu9yp	1
cml633w4r000j116escmi83iz	cml633w4r0001116ek2yc70mn	cmkhypyn00018n2bnbocygyyt	1
\.


--
-- Data for Name: gift_boxes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gift_boxes (id, name, description, "packingCost", "totalCost", "businessId", "createdAt", "giftBoxCode", "sellingPrice") FROM stdin;
cmkjcuryb000lk6x3biin9yqg	Budget Gift Box 2	Girls	100	1500	cmk7z81uc0000h9h1ifjz33vf	2026-01-18 06:28:25.475	GX-003	0
cmkjc16m60001k6x3057nkz94	Hair Clips Gift Box	Only Hair Clips	110	1000	cmk7z81uc0000h9h1ifjz33vf	2026-01-18 06:05:24.798	GX-001	0
cmkjcq3qm000ak6x32iapvf3a	Budget Gift Box 1	Girls	115	1500	cmk7z81uc0000h9h1ifjz33vf	2026-01-18 06:24:47.47	GX-002	0
cmkjfrbsf0001qvvhlp2eet5a	Kids Gift Box 1	Kids	105	2000	cmk7z81uc0000h9h1ifjz33vf	2026-01-18 07:49:43.407	GX-004	0
cml5c1dcq0001slpvxzih44bx	Budget Gift Box 3	Girls	115	3000	cmk7z81uc0000h9h1ifjz33vf	2026-02-02 15:36:29.401	GX-005	0
cml5cco3p000kslpvl3lajlm3	Budget Gift Box 4	Girls	130	3000	cmk7z81uc0000h9h1ifjz33vf	2026-02-02 15:45:16.549	GX-006	0
cml5zy8gu000tslpvjsvfwi9w	Budget Gift Box 5	Girls	100	1000	cmk7z81uc0000h9h1ifjz33vf	2026-02-03 02:45:53.887	GX-007	0
cml633w4r0001116ek2yc70mn	Budget Gift Box 6	Girls	125	1677	cmk7z81uc0000h9h1ifjz33vf	2026-02-03 04:14:16.683	GX-008	0
\.


--
-- Data for Name: income; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.income (id, date, amount, description, source, "businessId") FROM stdin;
cmk8bymgi0005vy4cdre71ze9	2026-01-10 13:17:57.425	9650	2025 - Sale 1 	manual	cmk7z81uc0000h9h1ifjz33vf
cmk8c06y50009vy4cblvfmzuz	2026-01-10 13:19:10.637	5960	2025 - Sale 2	manual	cmk7z81uc0000h9h1ifjz33vf
cmk8cmayo0008a37hsijuzthf	2026-01-10 13:36:22.271	16220	2025 - Sales 3	manual	cmk7z81uc0000h9h1ifjz33vf
cmk8czllc000ja37hukqm1f1l	2026-01-10 13:46:42.575	21910	2025 - Sale 4	manual	cmk7z81uc0000h9h1ifjz33vf
cmk8d05yz000la37hq00q0s30	2026-01-10 13:47:08.986	2500	Amma's bank gift packs	manual	cmk7z81uc0000h9h1ifjz33vf
cmkthbabc000slcyie905bukm	2026-01-25 08:30:55.993	990	Bill BILL-1769329855966-1	billing	cmk7z81uc0000h9h1ifjz33vf
cmm083u490008ulhe9l3jcsh4	2026-02-24 06:27:17.434	125	Bill BILL-1771914437420-2	billing	cmk7z81uc0000h9h1ifjz33vf
cmnexwbob00082krq7hpusjg8	2026-03-31 18:17:45.755	6100	Bill BILL-1774981065738-1	billing	cmk7zelbv0001h9h1i9e7lb3u
cmney4ovv000h2krqyhwi5816	2026-03-31 18:24:16.123	6100	Bill BILL-1774981456099-2	billing	cmk7zelbv0001h9h1i9e7lb3u
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.items (id, "itemName", "categoryId", "baseRefCode", "costPrice", "sellingPrice", "businessId", "costPriceCode", "stockQuantity", variants, tags, images) FROM stdin;
cmk836icl000p2xwmxt3t8eal	Labubu Note Book	cmk82sxx200032xwma96pclv4	NB-001	130	300	cmk7z81uc0000h9h1ifjz33vf	EGD	20	[{"size": "", "color": "Blue", "quantity": "5"}, {"size": "", "color": "Green", "quantity": "5"}, {"size": "", "color": "Pink", "quantity": "4"}, {"size": "", "color": "Yellow", "quantity": "6"}]	["Women", "Kids"]	[]
cmki6yept001wn2bn81x3ojm5	Fluffy Ear	cmk82xjd600052xwmamdfcrkv	WB-005	65	110	cmk7z81uc0000h9h1ifjz33vf	JI	12	[]	\N	\N
cmki77olt0024n2bnqgcgx1o3	Half moon	cmk83343k000j2xwm773n82gl	CT-001	10	15	cmk7z81uc0000h9h1ifjz33vf	ED	17	[]	\N	\N
cmki7ae4n0028n2bn9lo3olvt	Toffee and Bear	cmk83343k000j2xwm773n82gl	CT-002	45	60	cmk7z81uc0000h9h1ifjz33vf	HI	5	[]	\N	\N
cmki7bb30002en2bn4rahfpyi	Bear Slime	cmki7avsn002cn2bnrcjk3x15	SL-001	40	60	cmk7z81uc0000h9h1ifjz33vf	HD	2	[]	\N	\N
cmkjcwano000vk6x3mf06diwu	Glass bottle	cmk832ax4000d2xwm8iz1bq79	WT-001	225	450	cmk7z81uc0000h9h1ifjz33vf	FFI	3	[]	["Women"]	\N
cmki8x769004jn2bnx47r64vm	Boys normal	cmki8uwkw0049n2bn6e6dsxk4	PR-003	100	200	cmk7z81uc0000h9h1ifjz33vf	EDD	3	[]	["Men"]	\N
cmki8tri2003yn2bn073w6352	Girlish	cmk7ziylg0009h9h1w4nl4ks4	BR-002	98	250	cmk7z81uc0000h9h1ifjz33vf	ML	23	[]	\N	\N
cmki8rv59003un2bnqz8xcjde	Black and white	cmk7ziylg0009h9h1w4nl4ks4	BR-001	98	250	cmk7z81uc0000h9h1ifjz33vf	ML	33	[]	\N	\N
cmki8uko90045n2bn4mgo9nt0	Tiger Eye	cmk7ziylg0009h9h1w4nl4ks4	BR-003	450	950	cmk7z81uc0000h9h1ifjz33vf	HID	1	[]	\N	\N
cmki8wgtd004fn2bn6at2ixxw	Crystal	cmki8uwkw0049n2bn6e6dsxk4	PR-002	450	900	cmk7z81uc0000h9h1ifjz33vf	HID	1	[]	\N	\N
cmki8vvzd004bn2bncg397yqg	Pearl	cmki8uwkw0049n2bn6e6dsxk4	PR-001	250	650	cmk7z81uc0000h9h1ifjz33vf	FID	4	[]	\N	\N
cmki90fw9004rn2bn4vh3iyun	Silver Jumka	cmki8z89m004pn2bn4pyp39sd	ES-001	150	300	cmk7z81uc0000h9h1ifjz33vf	EID	6	[]	\N	\N
cmki91tib004vn2bnfxiup92l	Flower Plastic	cmki8z89m004pn2bn4pyp39sd	ES-002	40	80	cmk7z81uc0000h9h1ifjz33vf	HD	20	[]	\N	\N
cmki92jc1004zn2bnyobhjttp	Pearl	cmki8z89m004pn2bn4pyp39sd	ES-003	55	150	cmk7z81uc0000h9h1ifjz33vf	II	6	[]	\N	\N
cmki937hy0053n2bnihh5ryu0	Butterfly Handmade 	cmki8z89m004pn2bn4pyp39sd	ES-004	120	250	cmk7z81uc0000h9h1ifjz33vf	EFD	3	[]	\N	\N
cmki93t9v0057n2bnrye60muu	Butterfly	cmki8z89m004pn2bn4pyp39sd	ES-005	25	100	cmk7z81uc0000h9h1ifjz33vf	FI	4	[]	\N	\N
cmkjcwy3t000zk6x3ensiax7h	Plastic covered bottle	cmk832ax4000d2xwm8iz1bq79	WT-002	225	450	cmk7z81uc0000h9h1ifjz33vf	FFI	3	[]	\N	\N
cmk85rj69000716fdanpfqqko	Fluffy Clip Cartoon	cmk7zj9lv000bh9h1l22ems7a	HC-001	75	100	cmk7z81uc0000h9h1ifjz33vf	KI	8	[]	\N	\N
cmki85quf0038n2bndwymzx6h	Butterfly glass dual	cmk7zj9lv000bh9h1l22ems7a	HC-008	65	160	cmk7z81uc0000h9h1ifjz33vf	JI	6	[]	\N	\N
cmki82aqs0034n2bn2lstalzf	Six mini clips pack	cmk7zj9lv000bh9h1l22ems7a	HC-007	100	200	cmk7z81uc0000h9h1ifjz33vf	EDD	18	[]	\N	\N
cmki7pyxp002pn2bney09yx31	Curly and Butterfly Luminus	cmk7zj9lv000bh9h1l22ems7a	HC-005	70	150	cmk7z81uc0000h9h1ifjz33vf	KD	18	[]	\N	\N
cmk85vsyd000b16fd4k0w7es5	Fluffy Clip Normal	cmk7zj9lv000bh9h1l22ems7a	HC-003	130	200	cmk7z81uc0000h9h1ifjz33vf	EGD	8	[]	\N	\N
cmki86mhk003cn2bn09l3bmvz	Butterfly glass	cmk7zj9lv000bh9h1l22ems7a	HC-009	40	80	cmk7z81uc0000h9h1ifjz33vf	HD	13	[]	\N	\N
cmk86zflu000r16fdirbepq33	Plain Erasers	cmk832wzy000h2xwmsclcpvad	ER-001	35	50	cmk7z81uc0000h9h1ifjz33vf	GI	11	[]	["Kids"]	\N
cmk86r5gb000n16fdp89i2702	Sticky Notes Color Tapes	cmk86pns3000l16fdkg8ilqg4	SN-001	90	110	cmk7z81uc0000h9h1ifjz33vf	MD	12	[]	["Kids"]	\N
cmk865ijm000d16fdf3n8z3pr	Labubu Combs	cmk831sfn00092xwmktsx2tix	CB-001	95	125	cmk7z81uc0000h9h1ifjz33vf	MI	16	[]	\N	\N
cmki7ex0g002in2bnm5103qg3	Milk bottle	cmk832wzy000h2xwmsclcpvad	ER-002	60	80	cmk7z81uc0000h9h1ifjz33vf	JD	2	[]	\N	\N
cmk85jwp6000516fdaklp50fq	Hair Spring Band With Flower	cmk82xjd600052xwmamdfcrkv	WB-002	50	80	cmk7z81uc0000h9h1ifjz33vf	ID	10	[]	\N	\N
cmk876qpe000x16fd9hf2g5io	Pencil Box Normal	cmk86snz1000p16fdbfzpwiw6	PB-002	150	300	cmk7z81uc0000h9h1ifjz33vf	EID	4	[]	\N	\N
cmk85tely000916fdm07jrn21	Labubu Fluffy Clip	cmk7zj9lv000bh9h1l22ems7a	HC-002	135	200	cmk7z81uc0000h9h1ifjz33vf	EGI	8	[]	\N	\N
cmk87h7ii0001qvqusv0ocyds	Rular 6 inch	cmk871ser000t16fdfg1kcjxk	RL-001	35	60	cmk7z81uc0000h9h1ifjz33vf	GI	29	[]	\N	\N
cmk84is7v0001b76k5z28dug2	Color Pen Set - Speed	cmk843a320001k63u6hwf3q9u	PN-001	90	125	cmk7z81uc0000h9h1ifjz33vf	MD	11	[]	\N	\N
cmk83ljzm00112xwm40r5wxui	Correction Tape	cmk83jpiy000z2xwmw15v15zh	TX-001	63	120	cmk7z81uc0000h9h1ifjz33vf	JG	11	[]	\N	\N
cmk82yhh700072xwmjb3b84y7	Fluffy Wool Bands with Heart	cmk82xjd600052xwmamdfcrkv	WB-001	65	100	cmk7z81uc0000h9h1ifjz33vf	JI	9	[]	\N	\N
cmk834cx7000n2xwmn7jx0crw	Kids Lunch Box with Bottle	cmk833am1000l2xwm5l0q2z4u	LB-001	520	650	cmk7z81uc0000h9h1ifjz33vf	IFD	1	[]	\N	\N
cmk85904d0005124wa21tnhtf	Sticker Card L	cmk8571zs0001124wxb25124q	ST-002	25	60	cmk7z81uc0000h9h1ifjz33vf	FI	12	[]	\N	\N
cmk85c79n000316fd03zf5m1o	Labubu Purse	cmk85bjin000116fd4h3ddtr1	PU-001	650	750	cmk7z81uc0000h9h1ifjz33vf	JID	3	[]	\N	\N
cmk84y5l4000bjff4csel847m	Dumindu Platignum 12 Set 	cmk84w5wt0008jff4nnqstghk	PS-001	215	470	cmk7z81uc0000h9h1ifjz33vf	FEI	6	[]	\N	\N
cmkhx2sf10004n2bnypcuot1e	Mini Highlighter	cmk832pba000f2xwmm0inr75p	HG-001	52	80	cmk7z81uc0000h9h1ifjz33vf	IF	21	[]	\N	\N
cmk86hclt000f16fd06s4m0j8	Kids Hair Clip Pair	cmk7zj9lv000bh9h1l22ems7a	HC-004	75	120	cmk7z81uc0000h9h1ifjz33vf	KI	12	[]	\N	\N
cmk86ml5z000j16fdqivewdsv	Labubu	cmk86l2oi000h16fdo6h779yw	KT-001	60	100	cmk7z81uc0000h9h1ifjz33vf	JD	8	[]	\N	\N
cmk873gg0000v16fd4cjii28t	Pencil Box Set	cmk86snz1000p16fdbfzpwiw6	PB-001	270	450	cmk7z81uc0000h9h1ifjz33vf	FKD	5	[]	\N	\N
cmk84tzl30004jff48gfu8cfd	Small Math Box	cmk84tdb40001jff4p5603e5i	MX-001	110	180	cmk7z81uc0000h9h1ifjz33vf	EED	10	[]	\N	\N
cmk897jdq0003zxpdio3v1cbg	Normal Pencil	cmk896tr80001zxpdx27evgvm	PC-001	24	30	cmk7z81uc0000h9h1ifjz33vf	FH	12	[]	\N	\N
cmkhx9um2000an2bnj4reodqr	Ladies Mini Perfume	cmkhx7ua10008n2bnyktigqd7	PF-001	120	300	cmk7z81uc0000h9h1ifjz33vf	EFD	6	[]	\N	\N
cmkhxai0d000en2bnsa07pnvo	Gents Mini Perfume	cmkhx7ua10008n2bnyktigqd7	PF-002	120	300	cmk7z81uc0000h9h1ifjz33vf	EFD	6	[]	\N	\N
cmkhxoqv4000on2bnsobr6lwf	Boys necklace 	cmkhxnn9t000mn2bna4030fxb	NC-001	150	350	cmk7z81uc0000h9h1ifjz33vf	EID	6	[]	\N	\N
cmkhy5hq10012n2bngmzn8w2e	Watch Bangles	cmkhy3jc90010n2bnpw0ogjt6	WC-001	550	1200	cmk7z81uc0000h9h1ifjz33vf	IID	5	[]	\N	\N
cmkhypyn00018n2bnbocygyyt	Woolen Head Band	cmkhyo07d0016n2bn1as6esbx	HB-001	110	250	cmk7z81uc0000h9h1ifjz33vf	EED	7	[]	\N	\N
cmkhytohu001cn2bnnksy4dkl	Fluffy Star	cmk86l2oi000h16fdo6h779yw	KT-002	65	150	cmk7z81uc0000h9h1ifjz33vf	JI	8	[]	\N	\N
cmkhyvxch001gn2bnyvlf7fsq	Hello kitty	cmk86l2oi000h16fdo6h779yw	KT-003	30	70	cmk7z81uc0000h9h1ifjz33vf	GD	4	[]	\N	\N
cmkhz861n001kn2bnpcr7furz	Bow 	cmk871ser000t16fdfg1kcjxk	RL-002	55	75	cmk7z81uc0000h9h1ifjz33vf	II	2	[]	\N	\N
cmki6sysy001on2bn45o1vpi8	Flower Band	cmk82xjd600052xwmamdfcrkv	WB-003	85	160	cmk7z81uc0000h9h1ifjz33vf	LI	8	[]	\N	\N
cmki6ximp001sn2bnbmhtfpo9	Fluffy normal	cmk82xjd600052xwmamdfcrkv	WB-004	40	70	cmk7z81uc0000h9h1ifjz33vf	HD	9	[]	\N	\N
cmki7sw4n002tn2bnh0c7c6pa	Normal Clips	cmk7zj9lv000bh9h1l22ems7a	HC-006	65	130	cmk7z81uc0000h9h1ifjz33vf	JI	7	[]	\N	\N
cmki7vztd002xn2bnmbhr1i2j	Pencil Purse	cmk86snz1000p16fdbfzpwiw6	PB-003	200	300	cmk7z81uc0000h9h1ifjz33vf	FDD	1	[]	\N	\N
cmki8cn7c003in2bn614zluhd	Huda beauty	cmki8b9o8003gn2bniswvtegv	LL-001	100	130	cmk7z81uc0000h9h1ifjz33vf	EDD	11	[]	\N	\N
cmki8ghh2003mn2bngja5vh2d	Unicorn Gel	cmk843a320001k63u6hwf3q9u	PN-002	70	120	cmk7z81uc0000h9h1ifjz33vf	KD	8	[]	\N	\N
cmki8ivpw003qn2bnj73zu9yp	Erasable pen	cmk843a320001k63u6hwf3q9u	PN-003	70	120	cmk7z81uc0000h9h1ifjz33vf	KD	6	[]	\N	\N
cmkhxjrvt000in2bnkzibzyeo	Fairy girl mini notebook	cmk82sxx200032xwma96pclv4	NB-002	135	220	cmk7z81uc0000h9h1ifjz33vf	EGI	3	[]	["Women", "Kids"]	\N
cmn8tvxqu000h5n8k4ycqb6bu	Bath and Body Body Works Body Sprays	cmn8t51tv00035n8kapgjuzks	BSL-001	4300	6100	cmk7zelbv0001h9h1i9e7lb3u	HGDD	1	[{"size": "", "color": "In the Stars", "quantity": 0}, {"size": "", "color": "Butterfly", "quantity": 0}, {"size": "", "color": "Sweetest Song", "quantity": 1}]	["Woman"]	\N
cmn8tr21m000d5n8khzey1uh3	Bath and Body Body Works Lotions	cmn8t4ckf00015n8kzb8znchz	BL-001	4300	6100	cmk7zelbv0001h9h1i9e7lb3u	HGDD	5	[{"size": "", "color": "In the stars", "quantity": 1}, {"size": "", "color": "Butterfly", "quantity": 2}, {"size": "", "color": "Sweetest Song", "quantity": 2}]	["Woman"]	\N
cmki72kvv0020n2bnmvyquidi	Chinese Pencil	cmk896tr80001zxpdx27evgvm	PC-002	12.5	20	cmk7z81uc0000h9h1ifjz33vf	EF	25	[]	["Kids"]	\N
cmn8tyfo5000l5n8k95x4kilb	Bath and Body Body Works Body Sprays Gents	cmn8t5gmx00055n8keb6cz1ia	BSG-001	4300	6100	cmk7zelbv0001h9h1i9e7lb3u	HGDD	1	[{"size": "", "color": "Noir", "quantity": 1}]	["Men"]	\N
cmnlgj50700054gg0ot3i8vrw	Simple Heart Pen	cmn8tzby1000p5n8klko3vu7w	PN-004	55	150	cmk7zelbv0001h9h1i9e7lb3u	II	5	[{"size": "", "color": "White", "quantity": 1}, {"size": "", "color": "Pink", "quantity": 1}, {"size": "", "color": "Light Pink", "quantity": 1}, {"size": "", "color": "Purple", "quantity": 1}, {"size": "", "color": "Majenta", "quantity": 1}]	["Kids", "Woman", "Journaling", "Stationary"]	\N
cmnlg9six00014gg0fw63dxu1	Peekaboo Pen	cmn8tzby1000p5n8klko3vu7w	PN-003	65	150	cmk7zelbv0001h9h1i9e7lb3u	JI	5	[{"size": "", "color": "Blue Major", "quantity": 1}, {"size": "", "color": "Pink Major", "quantity": 1}, {"size": "", "color": "Pink Minor", "quantity": 1}, {"size": "", "color": "Brown Major", "quantity": 1}, {"size": "", "color": "Brown Minor", "quantity": 1}]	["Woman", "Kids", "Journaling", "Stationary"]	\N
cmnlgxjs0000d4gg02m2e4rpe	Infinite Bracelet	cmn8t698j00095n8kyvh8mls0	BR-001	750	2000	cmk7zelbv0001h9h1i9e7lb3u	KID	5	[{"size": "", "color": "Gold", "quantity": 1}, {"size": "", "color": "Silver", "quantity": 2}, {"size": "", "color": "Rose Gold", "quantity": 2}]	["Woman", "Jewellery "]	\N
cmn8u7nts000v5n8kbhny0c60	Kitty Gel Pens with magnet top 	cmn8tzby1000p5n8klko3vu7w	PN-001	67	178	cmk7zelbv0001h9h1i9e7lb3u	JK	7	[{"size": "", "color": "White Pink", "quantity": 1}, {"size": "", "color": "White Blue", "quantity": 1}, {"size": "", "color": "White Purple", "quantity": 1}, {"size": "", "color": "White Yellow", "quantity": 1}, {"size": "", "color": "Brown", "quantity": 1}, {"size": "", "color": "Pink", "quantity": 1}, {"size": "", "color": "Blue", "quantity": 1}]	["Women", "Kids", "Journaling", "Stationary"]	\N
cmnilmy3w0001xua5hpfce0lm	Pen with Animal faces on Top	cmn8tzby1000p5n8klko3vu7w	PN-002	60	150	cmk7zelbv0001h9h1i9e7lb3u	JD	4	[{"size": "", "color": "Grey", "quantity": 1}, {"size": "", "color": "Pink", "quantity": 1}, {"size": "", "color": "White", "quantity": 1}, {"size": "", "color": "Light Grey", "quantity": 1}]	["Kids", "Woman", "Journaling", "Stationary"]	\N
cmnlgqcmr00094gg0efhimlxf	Coal Ball	cmn8tzby1000p5n8klko3vu7w	PN-005	65	150	cmk7zelbv0001h9h1i9e7lb3u	JI	4	[{"size": "", "color": "Ash", "quantity": 1}, {"size": "", "color": "Black", "quantity": 1}, {"size": "", "color": "White", "quantity": 1}, {"size": "", "color": "White B", "quantity": 1}]	["Kids", "Woman", "Journaling", "Stationary"]	\N
cmnlh5vjv000j4gg0bdyd0s0f	Clove Bracelet	cmn8t698j00095n8kyvh8mls0	BR-002	250	1150	cmk7zelbv0001h9h1i9e7lb3u	FID	5	[{"size": "", "color": "White", "quantity": 2}, {"size": "", "color": "Black", "quantity": 2}, {"size": "", "color": "Pink", "quantity": 1}]	["Women", "Jewellery"]	\N
cmnlhabx3000n4gg0528hd9o5	Bohemian Bracelet 4pc Set	cmn8t698j00095n8kyvh8mls0	BR-003	625	1850	cmk7zelbv0001h9h1i9e7lb3u	JFI	6	[{"size": "", "color": "Brown", "quantity": 2}, {"size": "", "color": "Red", "quantity": 2}, {"size": "", "color": "Pink", "quantity": 2}]	["Woman", "Foreign"]	\N
cmnlhckb2000r4gg0q1i8tj9g	Bohemian Bracelet 9pc Set	cmn8t698j00095n8kyvh8mls0	BR-004	840	2200	cmk7zelbv0001h9h1i9e7lb3u	LHD	2	[{"size": "", "color": "Blue", "quantity": 2}]	["Woman", "Foreign"]	\N
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_movements (id, "itemId", "movementType", quantity, reason, reference, "createdAt", "businessId", "variantId") FROM stdin;
cmk8abpv40006pvytqj3oihxx	cmk85jwp6000516fdaklp50fq	OUT	1	bill	BILL-1768048329129-2	2026-01-10 12:32:09.136	cmk7z81uc0000h9h1ifjz33vf	\N
cmk8abpv7000apvyt2vdze4pb	cmk876qpe000x16fd9hf2g5io	OUT	1	bill	BILL-1768048329129-2	2026-01-10 12:32:09.139	cmk7z81uc0000h9h1ifjz33vf	\N
cmk8alquk00021j91duql7hfl	cmk85jwp6000516fdaklp50fq	IN	1	bill_reversal	Deleted bill BILL-1768047012174-1	2026-01-10 12:39:56.973	cmk7z81uc0000h9h1ifjz33vf	\N
cmk8alquo00041j91oi3u7wl8	cmk86zflu000r16fdirbepq33	IN	1	bill_reversal	Deleted bill BILL-1768047012174-1	2026-01-10 12:39:56.976	cmk7z81uc0000h9h1ifjz33vf	\N
cmk8am3vw00071j91g97ill7f	cmk85jwp6000516fdaklp50fq	IN	1	bill_reversal	Deleted bill BILL-1768048329129-2	2026-01-10 12:40:13.868	cmk7z81uc0000h9h1ifjz33vf	\N
cmk8am3vy00091j911ez91tb7	cmk876qpe000x16fd9hf2g5io	IN	1	bill_reversal	Deleted bill BILL-1768048329129-2	2026-01-10 12:40:13.87	cmk7z81uc0000h9h1ifjz33vf	\N
cmkhvift90002n2bnqf21h8ln	cmk87h7ii0001qvqusv0ocyds	IN	5	adjustment	\N	2026-01-17 05:35:10.221	cmk7z81uc0000h9h1ifjz33vf	\N
cmkhx2sf50006n2bn7ivcwf5g	cmkhx2sf10004n2bnypcuot1e	IN	17	initial	\N	2026-01-17 06:18:59.297	cmk7z81uc0000h9h1ifjz33vf	\N
cmkhx9um6000cn2bns3k0bn7i	cmkhx9um2000an2bnj4reodqr	IN	6	initial	\N	2026-01-17 06:24:28.734	cmk7z81uc0000h9h1ifjz33vf	\N
cmkhxai0g000gn2bnucawvq7y	cmkhxai0d000en2bnsa07pnvo	IN	6	initial	\N	2026-01-17 06:24:59.056	cmk7z81uc0000h9h1ifjz33vf	\N
cmkhxjrvw000kn2bnypzwmqpw	cmkhxjrvt000in2bnkzibzyeo	IN	3	initial	\N	2026-01-17 06:32:11.757	cmk7z81uc0000h9h1ifjz33vf	\N
cmkhxoqv7000qn2bnmbl0wjyy	cmkhxoqv4000on2bnsobr6lwf	IN	6	initial	\N	2026-01-17 06:36:03.715	cmk7z81uc0000h9h1ifjz33vf	\N
cmkhy5hq60014n2bnicv8me56	cmkhy5hq10012n2bngmzn8w2e	IN	5	initial	\N	2026-01-17 06:49:05.022	cmk7z81uc0000h9h1ifjz33vf	\N
cmkhypyn4001an2bnaoxqv4rx	cmkhypyn00018n2bnbocygyyt	IN	7	initial	\N	2026-01-17 07:05:00.064	cmk7z81uc0000h9h1ifjz33vf	\N
cmkhytohx001en2bnzw8lwoqd	cmkhytohu001cn2bnnksy4dkl	IN	8	initial	\N	2026-01-17 07:07:53.541	cmk7z81uc0000h9h1ifjz33vf	\N
cmkhyvxck001in2bnqnv8ttz9	cmkhyvxch001gn2bnyvlf7fsq	IN	4	initial	\N	2026-01-17 07:09:38.324	cmk7z81uc0000h9h1ifjz33vf	\N
cmkhz861s001mn2bneeuu2f8w	cmkhz861n001kn2bnpcr7furz	IN	2	initial	\N	2026-01-17 07:19:09.473	cmk7z81uc0000h9h1ifjz33vf	\N
cmki6syt4001qn2bnr09pkxa8	cmki6sysy001on2bn45o1vpi8	IN	8	initial	\N	2026-01-17 10:51:17.177	cmk7z81uc0000h9h1ifjz33vf	\N
cmki6xims001un2bn588knren	cmki6ximp001sn2bnbmhtfpo9	IN	9	initial	\N	2026-01-17 10:54:49.492	cmk7z81uc0000h9h1ifjz33vf	\N
cmki6yepy001yn2bnmylhxgx3	cmki6yept001wn2bn81x3ojm5	IN	12	initial	\N	2026-01-17 10:55:31.078	cmk7z81uc0000h9h1ifjz33vf	\N
cmki72kvy0022n2bn60flqyo1	cmki72kvv0020n2bnmvyquidi	IN	25	initial	\N	2026-01-17 10:58:45.694	cmk7z81uc0000h9h1ifjz33vf	\N
cmki77olx0026n2bnsuus0buk	cmki77olt0024n2bnqgcgx1o3	IN	17	initial	\N	2026-01-17 11:02:43.798	cmk7z81uc0000h9h1ifjz33vf	\N
cmki7ae4q002an2bn4nl58acv	cmki7ae4n0028n2bn9lo3olvt	IN	5	initial	\N	2026-01-17 11:04:50.187	cmk7z81uc0000h9h1ifjz33vf	\N
cmki7bb35002gn2bn9u61zsoe	cmki7bb30002en2bn4rahfpyi	IN	2	initial	\N	2026-01-17 11:05:32.897	cmk7z81uc0000h9h1ifjz33vf	\N
cmki7ex0j002kn2bnxl5y2sa3	cmki7ex0g002in2bnm5103qg3	IN	2	initial	\N	2026-01-17 11:08:21.283	cmk7z81uc0000h9h1ifjz33vf	\N
cmki7ficp002nn2bnqn27ddyv	cmkhx2sf10004n2bnypcuot1e	IN	4	adjustment	\N	2026-01-17 11:08:48.937	cmk7z81uc0000h9h1ifjz33vf	\N
cmki7pyxt002rn2bnx4h9xfb4	cmki7pyxp002pn2bney09yx31	IN	18	initial	\N	2026-01-17 11:16:56.993	cmk7z81uc0000h9h1ifjz33vf	\N
cmki7sw4p002vn2bnueq8pju8	cmki7sw4n002tn2bnh0c7c6pa	IN	7	initial	\N	2026-01-17 11:19:13.322	cmk7z81uc0000h9h1ifjz33vf	\N
cmki7vzth002zn2bnym01nrpb	cmki7vztd002xn2bnmbhr1i2j	IN	1	initial	\N	2026-01-17 11:21:38.069	cmk7z81uc0000h9h1ifjz33vf	\N
cmki7yisz0032n2bn4jzr0eji	cmki7pyxp002pn2bney09yx31	IN	1	adjustment	\N	2026-01-17 11:23:35.988	cmk7z81uc0000h9h1ifjz33vf	\N
cmki82aqv0036n2bn83844mvv	cmki82aqs0034n2bn2lstalzf	IN	19	initial	\N	2026-01-17 11:26:32.168	cmk7z81uc0000h9h1ifjz33vf	\N
cmki85quk003an2bnjxjb57eg	cmki85quf0038n2bndwymzx6h	IN	7	initial	\N	2026-01-17 11:29:13.005	cmk7z81uc0000h9h1ifjz33vf	\N
cmki86mhn003en2bnjv5ule7f	cmki86mhk003cn2bn09l3bmvz	IN	14	initial	\N	2026-01-17 11:29:54.011	cmk7z81uc0000h9h1ifjz33vf	\N
cmki8cn7g003kn2bnlmq7tyb5	cmki8cn7c003in2bn614zluhd	IN	11	initial	\N	2026-01-17 11:34:34.876	cmk7z81uc0000h9h1ifjz33vf	\N
cmki8ghh6003on2bn6qkzuxwu	cmki8ghh2003mn2bngja5vh2d	IN	8	initial	\N	2026-01-17 11:37:34.074	cmk7z81uc0000h9h1ifjz33vf	\N
cmki8ivq0003sn2bnu5c7640c	cmki8ivpw003qn2bnj73zu9yp	IN	6	initial	\N	2026-01-17 11:39:25.848	cmk7z81uc0000h9h1ifjz33vf	\N
cmki8rv5g003wn2bn9vktp6zb	cmki8rv59003un2bnqz8xcjde	IN	29	initial	\N	2026-01-17 11:46:25.012	cmk7z81uc0000h9h1ifjz33vf	\N
cmki8tri60040n2bn4yyjp5eb	cmki8tri2003yn2bn073w6352	IN	23	initial	\N	2026-01-17 11:47:53.598	cmk7z81uc0000h9h1ifjz33vf	\N
cmki8tzna0043n2bnht8qdj80	cmki8rv59003un2bnqz8xcjde	IN	4	adjustment	\N	2026-01-17 11:48:04.151	cmk7z81uc0000h9h1ifjz33vf	\N
cmki8ukob0047n2bnzmnwa7wc	cmki8uko90045n2bn4mgo9nt0	IN	1	initial	\N	2026-01-17 11:48:31.404	cmk7z81uc0000h9h1ifjz33vf	\N
cmki8vvzg004dn2bnzje1l2fy	cmki8vvzd004bn2bncg397yqg	IN	4	initial	\N	2026-01-17 11:49:32.716	cmk7z81uc0000h9h1ifjz33vf	\N
cmki8wgtf004hn2bnoakonlnp	cmki8wgtd004fn2bn6at2ixxw	IN	1	initial	\N	2026-01-17 11:49:59.716	cmk7z81uc0000h9h1ifjz33vf	\N
cmki8x76c004ln2bngsigyvfq	cmki8x769004jn2bnx47r64vm	IN	3	initial	\N	2026-01-17 11:50:33.876	cmk7z81uc0000h9h1ifjz33vf	\N
cmki90fwe004tn2bnjxswk1ku	cmki90fw9004rn2bn4vh3iyun	IN	6	initial	\N	2026-01-17 11:53:05.151	cmk7z81uc0000h9h1ifjz33vf	\N
cmki91tie004xn2bnysz75kbo	cmki91tib004vn2bnfxiup92l	IN	20	initial	\N	2026-01-17 11:54:09.446	cmk7z81uc0000h9h1ifjz33vf	\N
cmki92jc50051n2bnylrvrjun	cmki92jc1004zn2bnyobhjttp	IN	6	initial	\N	2026-01-17 11:54:42.917	cmk7z81uc0000h9h1ifjz33vf	\N
cmki937i10055n2bn0hgx8aj4	cmki937hy0053n2bnihh5ryu0	IN	3	initial	\N	2026-01-17 11:55:14.233	cmk7z81uc0000h9h1ifjz33vf	\N
cmki93t9y0059n2bn1r6sdlkw	cmki93t9v0057n2bnrye60muu	IN	4	initial	\N	2026-01-17 11:55:42.454	cmk7z81uc0000h9h1ifjz33vf	\N
cmkjcwanu000xk6x3uz8g7jz9	cmkjcwano000vk6x3mf06diwu	IN	3	initial	\N	2026-01-18 06:29:36.378	cmk7z81uc0000h9h1ifjz33vf	\N
cmkjcwy3w0011k6x3xjty82ad	cmkjcwy3t000zk6x3ensiax7h	IN	3	initial	\N	2026-01-18 06:30:06.764	cmk7z81uc0000h9h1ifjz33vf	\N
cmkthbab30006lcyi1uh67j1i	cmk85rj69000716fdanpfqqko	OUT	1	bill	BILL-1769329855966-1	2026-01-25 08:30:55.984	cmk7z81uc0000h9h1ifjz33vf	\N
cmkthbab5000alcyiefeuwq7q	cmki85quf0038n2bndwymzx6h	OUT	1	bill	BILL-1769329855966-1	2026-01-25 08:30:55.986	cmk7z81uc0000h9h1ifjz33vf	\N
cmkthbab7000elcyiplj9yo6z	cmki82aqs0034n2bn2lstalzf	OUT	1	bill	BILL-1769329855966-1	2026-01-25 08:30:55.987	cmk7z81uc0000h9h1ifjz33vf	\N
cmkthbab8000ilcyi4d0u9i3w	cmki7pyxp002pn2bney09yx31	OUT	1	bill	BILL-1769329855966-1	2026-01-25 08:30:55.989	cmk7z81uc0000h9h1ifjz33vf	\N
cmkthbaba000mlcyizx0r9e7l	cmk85vsyd000b16fd4k0w7es5	OUT	1	bill	BILL-1769329855966-1	2026-01-25 08:30:55.991	cmk7z81uc0000h9h1ifjz33vf	\N
cmkthbabc000qlcyijoykt4qw	cmki86mhk003cn2bn09l3bmvz	OUT	1	bill	BILL-1769329855966-1	2026-01-25 08:30:55.992	cmk7z81uc0000h9h1ifjz33vf	\N
cmm083u480006ulheouokioaf	cmk865ijm000d16fdf3n8z3pr	OUT	1	bill	BILL-1771914437420-2	2026-02-24 06:27:17.432	cmk7z81uc0000h9h1ifjz33vf	\N
cmn8tr222000f5n8k5h9l82wg	cmn8tr21m000d5n8khzey1uh3	IN	5	initial	\N	2026-03-27 11:35:04.491	cmk7zelbv0001h9h1i9e7lb3u	\N
cmn8tvxqx000j5n8kgtdup90g	cmn8tvxqu000h5n8k4ycqb6bu	IN	3	initial	\N	2026-03-27 11:38:52.185	cmk7zelbv0001h9h1i9e7lb3u	\N
cmn8tyfoa000n5n8k8qf3nkj6	cmn8tyfo5000l5n8k95x4kilb	IN	2	initial	\N	2026-03-27 11:40:48.731	cmk7zelbv0001h9h1i9e7lb3u	\N
cmn8u7ntx000x5n8k20v1may3	cmn8u7nts000v5n8kbhny0c60	IN	7	initial	\N	2026-03-27 11:47:59.206	cmk7zelbv0001h9h1i9e7lb3u	\N
cmnevnc4k00067h55fmgnedsw	cmki72kvv0020n2bnmvyquidi	OUT	1	bill	BILL-1774977287129-3	2026-03-31 17:14:47.204	cmk7z81uc0000h9h1ifjz33vf	\N
cmnevnzep000b7h55inuczy0m	cmki72kvv0020n2bnmvyquidi	IN	1	bill_reversal	Deleted bill BILL-1774977287129-3	2026-03-31 17:15:17.378	cmk7z81uc0000h9h1ifjz33vf	\N
cmnevtnaa000614irtc7je7cb	cmn8tvxqu000h5n8k4ycqb6bu	OUT	1	bill	BILL-1774977581545-1	2026-03-31 17:19:41.602	cmk7zelbv0001h9h1i9e7lb3u	\N
cmnevu5cp000b14ir70j8v8t2	cmn8tvxqu000h5n8k4ycqb6bu	IN	1	bill_reversal	Deleted bill BILL-1774977581545-1	2026-03-31 17:20:05.018	cmk7zelbv0001h9h1i9e7lb3u	\N
cmnew6dtg000i14irgmnc8rq8	cmn8tvxqu000h5n8k4ycqb6bu	OUT	1	bill	BILL-1774978175832-1	2026-03-31 17:29:35.861	cmk7zelbv0001h9h1i9e7lb3u	\N
cmnew6nyf000n14ir66jztoog	cmn8tvxqu000h5n8k4ycqb6bu	IN	1	bill_reversal	Deleted bill BILL-1774978175832-1	2026-03-31 17:29:49	cmk7zelbv0001h9h1i9e7lb3u	\N
cmnew87920006yor5h2q1h7ca	cmn8tyfo5000l5n8k95x4kilb	OUT	1	bill	BILL-1774978260631-1:variant-0	2026-03-31 17:31:00.662	cmk7zelbv0001h9h1i9e7lb3u	\N
cmnew8m3x000byor5o9yrep2v	cmn8tyfo5000l5n8k95x4kilb	IN	1	bill_reversal	Deleted bill BILL-1774978260631-1	2026-03-31 17:31:19.917	cmk7zelbv0001h9h1i9e7lb3u	\N
cmnewwjmk00066b19x1ywh9kb	cmn8tyfo5000l5n8k95x4kilb	OUT	1	bill	BILL-1774979396413-1:variant-0	2026-03-31 17:49:56.444	cmk7zelbv0001h9h1i9e7lb3u	\N
cmnewwz22000b6b199mrc3jkk	cmn8tyfo5000l5n8k95x4kilb	IN	1	bill_reversal	Deleted bill BILL-1774979396413-1	2026-03-31 17:50:16.442	cmk7zelbv0001h9h1i9e7lb3u	\N
cmnewxw980006619wjripu18r	cmn8tyfo5000l5n8k95x4kilb	OUT	1	bill	BILL-1774979459431-1:variant-0	2026-03-31 17:50:59.468	cmk7zelbv0001h9h1i9e7lb3u	\N
cmnewy343000b619wbk9wzz0b	cmn8tyfo5000l5n8k95x4kilb	IN	1	bill_reversal	Deleted bill BILL-1774979459431-1	2026-03-31 17:51:08.356	cmk7zelbv0001h9h1i9e7lb3u	\N
cmnexwbo900062krqe81w3j2b	cmn8tvxqu000h5n8k4ycqb6bu	OUT	1	bill	BILL-1774981065738-1:variant-0	2026-03-31 18:17:45.753	cmk7zelbv0001h9h1i9e7lb3u	\N
cmney4ovt000f2krqusq5fkci	cmn8tvxqu000h5n8k4ycqb6bu	OUT	1	bill	BILL-1774981456099-2:variant-1	2026-03-31 18:24:16.122	cmk7zelbv0001h9h1i9e7lb3u	\N
cmnilmy520003xua5n2kkyf8d	cmnilmy3w0001xua5hpfce0lm	IN	4	initial	\N	2026-04-03 07:45:37.623	cmk7zelbv0001h9h1i9e7lb3u	\N
cmnlg9sjh00034gg0c7sqewgj	cmnlg9six00014gg0fw63dxu1	IN	5	initial	\N	2026-04-05 07:38:44.285	cmk7zelbv0001h9h1i9e7lb3u	\N
cmnlgj50c00074gg01tpqecyl	cmnlgj50700054gg0ot3i8vrw	IN	5	initial	\N	2026-04-05 07:46:00.348	cmk7zelbv0001h9h1i9e7lb3u	\N
cmnlgqcmw000b4gg0ufjz61ml	cmnlgqcmr00094gg0efhimlxf	IN	4	initial	\N	2026-04-05 07:51:36.824	cmk7zelbv0001h9h1i9e7lb3u	\N
cmnlgxjs4000f4gg0lxtsmb3v	cmnlgxjs0000d4gg02m2e4rpe	IN	5	initial	\N	2026-04-05 07:57:12.676	cmk7zelbv0001h9h1i9e7lb3u	\N
cmnlh5vk0000l4gg0pi55yftk	cmnlh5vjv000j4gg0bdyd0s0f	IN	5	initial	\N	2026-04-05 08:03:41.184	cmk7zelbv0001h9h1i9e7lb3u	\N
cmnlhabx8000p4gg0l2nue43b	cmnlhabx3000n4gg0528hd9o5	IN	6	initial	\N	2026-04-05 08:07:09.02	cmk7zelbv0001h9h1i9e7lb3u	\N
cmnlhckb6000t4gg01vaztt57	cmnlhckb2000r4gg0q1i8tj9g	IN	2	initial	\N	2026-04-05 08:08:53.203	cmk7zelbv0001h9h1i9e7lb3u	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, role) FROM stdin;
cmk7yt8ft0000vvitl5qouyxe	admin	$2a$10$DobJw/47VWH7aRmyMp0m4eeM5qBqgpiyJZi/CITkZL2Kp/Vl.D5.i	admin
\.


--
-- Data for Name: variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.variants (id, "itemId", "variantCode", attributes, "stockQuantity", "qrCodeValue", "businessId") FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: bill_items bill_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_items
    ADD CONSTRAINT bill_items_pkey PRIMARY KEY (id);


--
-- Name: bills bills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT bills_pkey PRIMARY KEY (id);


--
-- Name: businesses businesses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_pkey PRIMARY KEY (id);


--
-- Name: capital capital_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.capital
    ADD CONSTRAINT capital_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: gift_box_items gift_box_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gift_box_items
    ADD CONSTRAINT gift_box_items_pkey PRIMARY KEY (id);


--
-- Name: gift_boxes gift_boxes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gift_boxes
    ADD CONSTRAINT gift_boxes_pkey PRIMARY KEY (id);


--
-- Name: income income_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.income
    ADD CONSTRAINT income_pkey PRIMARY KEY (id);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: variants variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variants
    ADD CONSTRAINT variants_pkey PRIMARY KEY (id);


--
-- Name: bills_billNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "bills_billNumber_key" ON public.bills USING btree ("billNumber");


--
-- Name: categories_categoryCode_businessId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "categories_categoryCode_businessId_key" ON public.categories USING btree ("categoryCode", "businessId");


--
-- Name: gift_boxes_giftBoxCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "gift_boxes_giftBoxCode_key" ON public.gift_boxes USING btree ("giftBoxCode");


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: variants_variantCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "variants_variantCode_key" ON public.variants USING btree ("variantCode");


--
-- Name: bill_items bill_items_billId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_items
    ADD CONSTRAINT "bill_items_billId_fkey" FOREIGN KEY ("billId") REFERENCES public.bills(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bill_items bill_items_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_items
    ADD CONSTRAINT "bill_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public.items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bill_items bill_items_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_items
    ADD CONSTRAINT "bill_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.variants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bills bills_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills
    ADD CONSTRAINT "bills_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: capital capital_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.capital
    ADD CONSTRAINT "capital_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: categories categories_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "categories_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: expenses expenses_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "expenses_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: gift_box_items gift_box_items_giftBoxId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gift_box_items
    ADD CONSTRAINT "gift_box_items_giftBoxId_fkey" FOREIGN KEY ("giftBoxId") REFERENCES public.gift_boxes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: gift_box_items gift_box_items_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gift_box_items
    ADD CONSTRAINT "gift_box_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public.items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: gift_boxes gift_boxes_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gift_boxes
    ADD CONSTRAINT "gift_boxes_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: income income_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.income
    ADD CONSTRAINT "income_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: items items_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT "items_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: items items_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT "items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_movements stock_movements_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT "stock_movements_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stock_movements stock_movements_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT "stock_movements_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public.items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stock_movements stock_movements_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT "stock_movements_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.variants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: variants variants_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variants
    ADD CONSTRAINT "variants_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: variants variants_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variants
    ADD CONSTRAINT "variants_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public.items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict GLck5ZN7XUuHc6SX39jZAhUGdm1PuDmdIFRSGdVzdXHaD0Hn3cDigQZbfr158Ke

