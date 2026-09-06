--
-- PostgreSQL database dump
--

\restrict NkR0jhp94Snx5Kqa7vgEAz0HLyFw4MCRvzjk4B79cj1aW5GMY94fcLdkmQCqcXA

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
    images jsonb,
    barcode text
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
    "businessId" text NOT NULL,
    barcode text NOT NULL
);


ALTER TABLE public.variants OWNER TO postgres;

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
-- Name: items_barcode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX items_barcode_key ON public.items USING btree (barcode);


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: variants_barcode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX variants_barcode_key ON public.variants USING btree (barcode);


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

\unrestrict NkR0jhp94Snx5Kqa7vgEAz0HLyFw4MCRvzjk4B79cj1aW5GMY94fcLdkmQCqcXA

