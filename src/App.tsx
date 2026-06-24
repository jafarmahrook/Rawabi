import { Component, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ErrorInfo, ReactNode } from "react";

type IngredientId =
  | "wheat"
  | "mill"
  | "stone"
  | "thyme"
  | "sumac"
  | "olive"
  | "eggplant"
  | "oil"
  | "pepper"
  | "milk"
  | "churn"
  | "salt"
  | "yogurt"
  | "sun"
  | "cocoa"
  | "chips"
  | "flour"
  | "oats"
  | "dates"
  | "nuts"
  | "vinegarBase"
  | "ginger"
  | "garlic"
  | "strawberry"
  | "cherry"
  | "honey";

type Ingredient = {
  id: IngredientId;
  name: string;
  short: string;
  tone: string;
  icon: string;
};

type Product = {
  id: string;
  name: string;
  english: string;
  message: string;
  family: string;
  vessel: string;
  color: string;
  accent: string;
  ingredients: IngredientId[];
  image?: string;
  cutout?: string;
  imageMode?: 'scene' | 'isolated';
  icon: string;
};

type Result = {
  id: string;
  name: string;
  score: number;
  products: number;
  bestStreak: number;
  createdAt: string;
};

type Screen = "start" | "playing" | "finished";

const ROUND_SECONDS = 60;
const RESULTS_KEY = "rawabi-minute-results-v1";

const ingredients: Ingredient[] = [
  { id: "wheat", name: "قمح بلدي", short: "قمح", tone: "#d7a23a", icon: "🌾" },
  { id: "mill", name: "مطحنة حجر", short: "مطحنة", tone: "#8b6b44", icon: "🪨" },
  { id: "stone", name: "حبة كاملة", short: "كاملة", tone: "#cbb26a", icon: "🤎" },
  { id: "thyme", name: "زعتر", short: "زعتر", tone: "#3f8a49", icon: "🌿" },
  { id: "sumac", name: "سماق", short: "سماق", tone: "#8c2f3b", icon: "🍒" },
  { id: "olive", name: "زيتون", short: "زيتون", tone: "#647a26", icon: "🫒" },
  { id: "eggplant", name: "باذنجان", short: "باذنجان", tone: "#5c2f64", icon: "🍆" },
  { id: "oil", name: "زيت زيتون", short: "زيت", tone: "#b9a327", icon: "🫙" },
  { id: "pepper", name: "فليفلة", short: "فليفلة", tone: "#bd4732", icon: "🌶️" },
  { id: "milk", name: "حليب غنم", short: "حليب", tone: "#f2eee0", icon: "🥛" },
  { id: "churn", name: "خض", short: "خض", tone: "#b88840", icon: "🥣" },
  { id: "salt", name: "ملح بلدي", short: "ملح", tone: "#d8d5c7", icon: "🧂" },
  { id: "yogurt", name: "لبن", short: "لبن", tone: "#ece5d4", icon: "🥣" },
  { id: "sun", name: "تجفيف", short: "تجفيف", tone: "#d89634", icon: "☀️" },
  { id: "cocoa", name: "كاكاو", short: "كاكاو", tone: "#633827", icon: "🫘" },
  { id: "chips", name: "شوكولاتة", short: "شوكو", tone: "#3d241d", icon: "🍫" },
  { id: "flour", name: "طحين", short: "طحين", tone: "#e0d5b8", icon: "🥡" },
  { id: "oats", name: "شوفان", short: "شوفان", tone: "#c08a45", icon: "🌾" },
  { id: "dates", name: "تمر", short: "تمر", tone: "#7b3b2f", icon: "🌴" },
  { id: "nuts", name: "مكسرات", short: "مكسرات", tone: "#b6753e", icon: "🥜" },
  { id: "vinegarBase", name: "خل طبيعي", short: "خل", tone: "#a17031", icon: "🍾" },
  { id: "ginger", name: "زنجبيل", short: "زنجبيل", tone: "#d6a243", icon: "🫚" },
  { id: "garlic", name: "ثوم", short: "ثوم", tone: "#eee8d7", icon: "🧄" },
  { id: "strawberry", name: "فراولة", short: "فراولة", tone: "#b9283d", icon: "🍓" },
  { id: "cherry", name: "كرز", short: "كرز", tone: "#7b1530", icon: "🍒" },
  { id: "honey", name: "عسل", short: "عسل", tone: "#d09428", icon: "🍯" },
];

const products: Product[] = [
  {
    id: "makdous",
    name: "مكدوس بالزيت",
    english: "Makdous in Oil",
    message: "مونة بيتية محفوظة بزيت الزيتون بيساعد على الهضم",
    family: "المونة البلدية",
    vessel: "jar",
    color: "#0f653c",
    accent: "#b44931",
    ingredients: ["eggplant", "oil", "pepper"],
    image: "brand/products/makdous.jpg",
    cutout: "brand/products/makdous-cutout.png",
    imageMode: "scene",
    icon: "🍆",
  },
  {
    id: "sheepGhee",
    name: "سمن غنم",
    english: "Sheep Ghee",
    message: "نكهة غنية ترفع كل طبخة لمستوى ثاني",
    family: "الألبان",
    vessel: "jar",
    color: "#f2d24d",
    accent: "#0f4a2b",
    ingredients: ["milk", "churn", "salt"],
    image: "brand/products/sheepGhee.jpg",
    cutout: "brand/products/sheepGhee-cutout.png",
    imageMode: "scene",
    icon: "🐄",
  },
  {
    id: "granola",
    name: "جرانولا",
    english: "Granola",
    message: "بتدعم النشاط والطاقة من التمر والشوفان والمكسرات",
    family: "وجبات خفيفة",
    vessel: "jar",
    color: "#7b3b2f",
    accent: "#2f8b45",
    ingredients: ["oats", "dates", "nuts"],
    image: "brand/products/granola.jpg",
    cutout: "brand/products/granola-cutout.png",
    imageMode: "scene",
    icon: "🌾",
  },
  {
    id: "vinegar",
    name: "خل التين الشوكي",
    english: "Natural Vinegar",
    message: "غني بالفيتامينات والمعادن ويدعم الهضم",
    family: "الخل الطبيعي",
    vessel: "bottle",
    color: "#af7431",
    accent: "#0f4a2b",
    ingredients: ["vinegarBase", "ginger", "garlic"],
    image: "brand/products/vinegar.jpg",
    cutout: "brand/products/vinegar-cutout.png",
    imageMode: "scene",
    icon: "🌵",
  },
  {
    id: "jam",
    name: "مربى روابي",
    english: "Fruit Marmalade",
    message: "غني بنكهة الفاكهة الطبيعية بطعم شهي",
    family: "المربيات",
    vessel: "jar",
    color: "#9d263a",
    accent: "#b48b46",
    ingredients: ["strawberry", "cherry", "honey"],
    image: "brand/products/jam.jpg",
    cutout: "brand/products/jam-cutout.png",
    imageMode: "scene",
    icon: "🍓",
  },
  {
    id: "wholeWheatFlour",
    name: "طحين قمح حبة كاملة",
    english: "Whole Wheat Flour",
    message: "طحين يجمع بين الأصالة والقيمة الغذائية",
    family: "الحبوب والمخبوزات",
    vessel: "bag",
    color: "#e8dcc0",
    accent: "#0f653c",
    ingredients: ["wheat", "mill", "stone"],
    image: "brand/products/flour.jpg",
    cutout: "brand/products/flour-cutout.png",
    imageMode: "scene",
    icon: "🍞",
  },
  {
    id: "freekeh",
    name: "فريكة بلدية",
    english: "Baladi Freekeh",
    message: "نكهة غنية وقيمة غذائية عالية",
    family: "الحبوب والمخبوزات",
    vessel: "bag",
    color: "#c69b56",
    accent: "#435229",
    ingredients: ["wheat", "sun", "mill"],
    image: "brand/products/freekeh.jpg",
    cutout: "brand/products/freekeh-cutout.png",
    imageMode: "scene",
    icon: "🌾",
  },
  {
    id: "barleyCoffee",
    name: "قهوة شعير",
    english: "Barley Coffee",
    message: "استمتعوا بمذاق قهوة الشعير الدافئ",
    family: "مشروبات ساخنة",
    vessel: "box",
    color: "#4e3629",
    accent: "#d69a47",
    ingredients: ["wheat", "cocoa", "mill"],
    image: "brand/products/barleyCoffee.jpg",
    cutout: "brand/products/barleyCoffee-cutout.png",
    imageMode: "scene",
    icon: "☕",
  },
  {
    id: "stuffedOlives",
    name: "زيتون محشي لبنة",
    english: "Stuffed Olives",
    message: "حشوة لبنة طازجة ونكهة مشوية لا تُقاوم",
    family: "المونة البلدية",
    vessel: "jar",
    color: "#6b7a2c",
    accent: "#391f16",
    ingredients: ["olive", "yogurt", "sun"],
    image: "brand/products/stuffedOlives.jpg",
    cutout: "brand/products/stuffedOlives-cutout.png",
    imageMode: "scene",
    icon: "🫒",
  }
];

const ingredientById = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]));
const productById = new Map(products.map((product) => [product.id, product]));

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function pickProduct(previousId?: string) {
  const choices = products.filter((product) => product.id !== previousId);
  return choices[Math.floor(Math.random() * choices.length)];
}

function createOptions(product: Product) {
  const required = new Set(product.ingredients);
  const distractors = shuffle(ingredients.filter((ingredient) => !required.has(ingredient.id)))
    .slice(0, 6)
    .map((ingredient) => ingredient.id);
  return shuffle([...product.ingredients, ...distractors]);
}

function loadResults(): Result[] {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Result[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveResults(results: Result[]) {
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results.slice(0, 20)));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-u-nu-latn", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [playerName, setPlayerName] = useState("");
  const [results, setResults] = useState<Result[]>(() => loadResults());
  const [currentProduct, setCurrentProduct] = useState(() => pickProduct());
  const [options, setOptions] = useState<IngredientId[]>(() => createOptions(currentProduct));
  const [selected, setSelected] = useState<IngredientId[]>([]);
  const [score, setScore] = useState(0);
  const [completedProducts, setCompletedProducts] = useState(0);
  const [productStreak, setProductStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [mistakePulse, setMistakePulse] = useState(false);
  const [successPulse, setSuccessPulse] = useState(false);
  const [wrongIngredient, setWrongIngredient] = useState<IngredientId | null>(null);
  const [roundLocked, setRoundLocked] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [lastResult, setLastResult] = useState<Result | null>(null);
  const [newRecord, setNewRecord] = useState(false);
  const endAtRef = useRef(0);
  const finishedRef = useRef(false);

  const sortedResults = useMemo(() => [...results].sort((a, b) => b.score - a.score), [results]);
  const highScore = sortedResults[0]?.score ?? 0;

  const [assetsReady, setAssetsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Helper to load a single image with timeout
    const loadImg = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // don't block on failure
        img.src = src;
      });

    // Phase 1: Load the 3 CSS background images (723KB total)
    // These are the critical decorative images — load them lazily after first paint
    const bgImages = [
      { src: "brand/products/wheat-field.png", varName: "--bg-wheat" },
      { src: "brand/products/hero-field-products.png", varName: "--bg-hero" },
      { src: "brand/products/seed-bank-shelf.png", varName: "--bg-shelf" },
    ];

    const bgPromises = bgImages.map(({ src, varName }) =>
      loadImg(src).then(() => {
        if (!cancelled) {
          document.documentElement.style.setProperty(varName, `url(${src})`);
        }
      })
    );

    // When all BG images are loaded, add bgLoaded class to trigger CSS transitions
    Promise.race([
      Promise.all(bgPromises),
      new Promise((r) => setTimeout(r, 6000)), // 6s max wait
    ]).then(() => {
      if (cancelled) return;
      document.querySelectorAll(
        ".ambient, .heroPanel, .showcasePanel, .finishShelf, .promoPanel"
      ).forEach((el) => el.classList.add("bgLoaded"));
    });

    // Phase 2: Preload product images during idle time (non-blocking)
    const preloadProducts = () => {
      products.forEach((product) => {
        if (product.image) loadImg(product.image);
        if (product.cutout) loadImg(product.cutout);
      });
      if (!cancelled) setAssetsReady(true);
    };

    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(preloadProducts, { timeout: 3000 });
    } else {
      setTimeout(preloadProducts, 200);
    }

    return () => { cancelled = true; };
  }, []);
  const isHarvest = screen === "playing" && secondsLeft <= 10;
  const multiplier = productStreak >= 3 ? 2 : 1;
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const nextRound = useCallback((previous: Product) => {
    const next = pickProduct(previous.id);
    setCurrentProduct(next);
    setOptions(createOptions(next));
    setSelected([]);
    setRoundLocked(false);
  }, []);

  const finishGame = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const safeName = playerName.trim() || `لاعب ${results.length + 1}`;
    const result: Result = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: safeName,
      score,
      products: completedProducts,
      bestStreak,
      createdAt: new Date().toISOString(),
    };
    const wasRecord = score > highScore;
    const updated = [...results, result].sort((a, b) => b.score - a.score).slice(0, 20);
    setResults(updated);
    saveResults(updated);
    setLastResult(result);
    setNewRecord(wasRecord);
    setScreen("finished");
  }, [bestStreak, completedProducts, highScore, playerName, results, score]);

  useEffect(() => {
    if (screen !== "playing") return undefined;
    const tick = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        window.clearInterval(tick);
        finishGame();
      }
    }, 140);
    return () => window.clearInterval(tick);
  }, [finishGame, screen]);

  const startGame = () => {
    const first = pickProduct();
    finishedRef.current = false;
    setCurrentProduct(first);
    setOptions(createOptions(first));
    setSelected([]);
    setRoundLocked(false);
    setScore(0);
    setCompletedProducts(0);
    setProductStreak(0);
    setBestStreak(0);
    setSecondsLeft(ROUND_SECONDS);
    setLastResult(null);
    setNewRecord(false);
    endAtRef.current = Date.now() + ROUND_SECONDS * 1000;
    setScreen("playing");
  };

  const handleIngredient = (ingredientId: IngredientId) => {
    if (screen !== "playing") return;
    if (roundLocked) return;
    if (selectedSet.has(ingredientId)) return;

    if (!currentProduct.ingredients.includes(ingredientId)) {
      setScore((value) => Math.max(0, value - 25));
      setProductStreak(0);
      endAtRef.current -= 1000;
      setMistakePulse(true);
      setWrongIngredient(ingredientId);
      window.setTimeout(() => setMistakePulse(false), 260);
      window.setTimeout(() => setWrongIngredient(null), 500);
      return;
    }

    const nextSelected = [...selected, ingredientId];
    const pointBase = isHarvest ? 70 : 50;
    setScore((value) => value + pointBase * multiplier);
    setSelected(nextSelected);

    if (nextSelected.length === currentProduct.ingredients.length) {
      const completionBase = isHarvest ? 240 : 150;
      const nextStreak = productStreak + 1;
      setRoundLocked(true);
      setScore((value) => value + completionBase * multiplier);
      setCompletedProducts((value) => value + 1);
      setProductStreak(nextStreak);
      setBestStreak((value) => Math.max(value, nextStreak));
      setSuccessPulse(true);
      window.setTimeout(() => setSuccessPulse(false), 380);
      window.setTimeout(() => nextRound(currentProduct), 420);
    }
  };

  const resetScores = () => {
    const accepted = window.confirm("مسح قائمة النتائج المحلية لهذا الجهاز؟");
    if (!accepted) return;
    localStorage.removeItem(RESULTS_KEY);
    setResults([]);
  };

  return (
    <main className={`app ${screen === "playing" ? "isPlaying" : ""} ${isHarvest ? "isHarvest" : ""}`}>
      <AmbientScene />
      <section className="gameShell" aria-live="polite">
        <header className="brandHeader">
          <div className="brandLockup">
            <OfficialLogo />
            <div className="brandTitle">
              <p className="brandName">RAWABI FARAH</p>
              <h1>خبير المونة</h1>
            </div>
          </div>
          <div className="brandPromise">من البذرة الأصيلة إلى منتج بلدي يصل للمائدة</div>
          <button className="adminReset" type="button" onClick={resetScores} aria-label="مسح النتائج">
            إدارة
          </button>
        </header>

        {screen === "start" && (
          <StartScreen
            playerName={playerName}
            setPlayerName={setPlayerName}
            highScore={highScore}
            sortedResults={sortedResults}
            startGame={startGame}
          />
        )}

        {screen === "playing" && (
          <PlayScreen
            product={currentProduct}
            options={options}
            selected={selected}
            score={score}
            secondsLeft={secondsLeft}
            multiplier={multiplier}
            completedProducts={completedProducts}
            bestStreak={bestStreak}
            mistakePulse={mistakePulse}
            successPulse={successPulse}
            wrongIngredient={wrongIngredient}
            isHarvest={isHarvest}
            onIngredient={handleIngredient}
            onEndGame={finishGame}
          />
        )}

        {screen === "finished" && lastResult && (
          <FinishScreen
            result={lastResult}
            newRecord={newRecord}
            sortedResults={sortedResults}
            highScore={Math.max(highScore, lastResult.score)}
            startGame={startGame}
            setScreen={setScreen}
          />
        )}
      </section>
    </main>
  );
}

type StartProps = {
  playerName: string;
  setPlayerName: (value: string) => void;
  highScore: number;
  sortedResults: Result[];
  startGame: () => void;
};

function StartScreen({ playerName, setPlayerName, highScore, sortedResults, startGame }: StartProps) {
  return (
    <div className="startLayout">
      {/* Left column: hero + leaderboard stacked */}
      <div className="startLeftCol">
        <section className="heroPanel">
          <div className="heroHeader">
            <p className="heroSubtitle">لعبة خبير المونة من روابي الفرح</p>
            <h2>اكسر الرقم في <span className="highlightTime">60 ثانية</span></h2>
            <p className="heroLine">جهز منتجات روابي فرح بسرعة، واربط المكوّن الصحيح بالعبوة الصحيحة.</p>
          </div>

          <div className="gameGuide">
            <h4 className="guideTitle">🎁 العب واربح كود خصم حصري!</h4>
            <div className="guideSteps">
              <div className="guideStep">
                <span className="stepIcon">🧐</span>
                <span className="stepText">1. اقرأ المكوّن</span>
              </div>
              <div className="guideStep">
                <span className="stepIcon">🎯</span>
                <span className="stepText">2. طابقه بالمنتج</span>
              </div>
              <div className="guideStep">
                <span className="stepIcon">🎉</span>
                <span className="stepText">3. اكسب الخصم</span>
              </div>
            </div>
          </div>

          <form
            className="startForm"
            onSubmit={(event) => {
              event.preventDefault();
              startGame();
            }}
          >
            <label htmlFor="playerName">اسم اللاعب</label>
            <div className="nameRow">
              <div className="inputWrapper">
                <span className="inputIcon">👤</span>
                <input
                  id="playerName"
                  value={playerName}
                  maxLength={18}
                  onChange={(event) => setPlayerName(event.target.value)}
                  placeholder="اكتب اسمك"
                  autoComplete="off"
                />
              </div>
              <button type="submit">
                ابدأ التحدي <span className="btnIcon">🚀</span>
              </button>
            </div>
          </form>
        </section>

        <Leaderboard results={sortedResults} />
      </div>

      {/* Right column: products (matches left column height, scrolls internally) */}
      <aside className="showcasePanel promoTheme">
        <div className="promoContent">
          <div className="promoLogoBox">
            <img src="brand/products/logo-full.png" alt="روابي فرح" />
          </div>
          <div className="promoTextContent">
            <h3 className="sectionTitle">منتجات روابي فرح</h3>
            <p>
              نقدم لك منتجات بلدية وطبيعية 100%، نعتني بها من المزرعة لتصل إلى مائدتك بأعلى معايير الجودة والأصالة.
            </p>
          </div>
        </div>
        
        <div className="miniShelf">
          {products.map((product) => (
            <ProductPack key={product.id} product={product} compact />
          ))}
        </div>
      </aside>
    </div>
  );
}

type PlayProps = {
  product: Product;
  options: IngredientId[];
  selected: IngredientId[];
  wrongIngredient: IngredientId | null;
  score: number;
  secondsLeft: number;
  multiplier: number;
  completedProducts: number;
  bestStreak: number;
  mistakePulse: boolean;
  successPulse: boolean;
  isHarvest: boolean;
  onIngredient: (ingredientId: IngredientId) => void;
  onEndGame: () => void;
};

function PlayScreen({
  product,
  options,
  selected,
  score,
  secondsLeft,
  multiplier,
  completedProducts,
  bestStreak,
  mistakePulse,
  successPulse,
  wrongIngredient,
  isHarvest,
  onIngredient,
  onEndGame,
}: PlayProps) {
  const selectedSet = new Set(selected);
  const progress = ((ROUND_SECONDS - secondsLeft) / ROUND_SECONDS) * 100;

  return (
    <div className={`playLayout ${mistakePulse ? "mistake" : ""} ${successPulse ? "success" : ""}`}>
      <section className="scoreRail">
        <TimerRing secondsLeft={secondsLeft} />
        <Stat label="النقاط" value={score.toLocaleString("en-US")} />
        <Stat label="المنتجات" value={completedProducts.toLocaleString("en-US")} />
        <Stat label="أفضل سلسلة" value={bestStreak.toLocaleString("en-US")} />
        <div className={`multiplier ${multiplier > 1 ? "active" : ""}`}>x{multiplier}</div>
        <button type="button" className="endGameBtn" onClick={onEndGame}>إنهاء اللعبة</button>
      </section>

      <section className="taskPanel">
        <div className="progressTrack">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="taskHeader">
          <div className="taskMeta">
            <p>{isHarvest ? "موسم الحصاد" : product.family}</p>
            <strong>{product.english}</strong>
          </div>
          <h2>{product.name}</h2>
        </div>
        <div className="productStage">
          <ProductPack product={product} animated />
          <div className="recipeSlots" aria-label="مكونات المنتج">
            {product.ingredients.map((ingredientId) => {
              const ingredient = ingredientById.get(ingredientId)!;
              const active = selectedSet.has(ingredientId);
              return (
                <div className={`recipeSlot ${active ? "filled" : ""}`} key={ingredientId}>
                  {active ? <IngredientGlyph ingredient={ingredient} /> : <span />}
                  <b>{active ? ingredient.short : "..."}</b>
                </div>
              );
            })}
          </div>
        </div>
        <p className="productMessage">{product.message}</p>
      </section>

      <section className="ingredientBoard" aria-label="اختيارات المكونات">
        {options.map((ingredientId) => {
          const ingredient = ingredientById.get(ingredientId)!;
          const picked = selectedSet.has(ingredientId);
          const wrong = wrongIngredient === ingredientId;
          return (
            <button
              className={`ingredientTile ${picked ? "picked" : ""} ${wrong ? "wrong" : ""}`}
              type="button"
              key={ingredientId}
              aria-pressed={picked}
              aria-label={ingredient.name}
              onClick={() => onIngredient(ingredientId)}
            >
              <IngredientGlyph ingredient={ingredient} />
              <span>{ingredient.name}</span>
            </button>
          );
        })}
      </section>
    </div>
  );
}

type FinishProps = {
  result: Result;
  newRecord: boolean;
  sortedResults: Result[];
  highScore: number;
  startGame: () => void;
  setScreen: (screen: Screen) => void;
};

function FinishScreen({ result, newRecord, sortedResults, highScore, startGame, setScreen }: FinishProps) {
  const title = newRecord ? "رقم قياسي جديد" : "جولة جاهزة للتذوق";

  return (
    <div className="finishLayout">
      <section className="resultPanel">
        <div className="resultHeader">
          <p className="microLabel">{title}</p>
          <h2>{result.name}</h2>
        </div>
        <div className="scoreSection">
          <span className="scoreLabel">النقاط</span>
          <div className="scoreHero">{result.score.toLocaleString("en-US")}</div>
        </div>
        <div className="statsStrip finishStats">
          <Stat label="المنتجات" value={result.products.toLocaleString("en-US")} />
          <Stat label="أفضل سلسلة" value={result.bestStreak.toLocaleString("en-US")} />
          <Stat label="الرقم الأعلى" value={highScore.toLocaleString("en-US")} />
        </div>
        <div className="finishActions">
          <button type="button" onClick={() => setScreen("start")}>
            شاشة البداية
          </button>
        </div>
      </section>

      <aside className="promoPanel">
        <div className="promoContent">
          <div className="promoLogoBox">
            <img src="brand/products/logo-full.png" alt="روابي فرح" />
          </div>
          <h3>من البذرة الأصيلة إلى المائدة</h3>
          <p>
            شكراً لاهتمامك بمنتجاتنا البلدية والطبيعية. لأنك أتممت التحدي ببراعة، نهديك خصماً حصرياً على طلبك القادم!
          </p>
          <div className="promoCodeBox">
            <span>استخدم كود الخصم:</span>
            <strong>RAWABI10</strong>
          </div>
          <button type="button" className="promoBtn" onClick={() => window.open('https://rawabi-farah.com', '_blank')}>تسوق الآن</button>
        </div>
      </aside>
    </div>
  );
}

function Leaderboard({ results, highlightId }: { results: Result[]; highlightId?: string }) {
  const topFive = results.slice(0, 5);

  return (
    <div className="leaderboard">
      <div className="leaderboardHeader">
        <h3>لوحة الشرف</h3>
        <span className="pointsLabel">النقاط</span>
      </div>
      {topFive.length === 0 ? (
        <p className="emptyBoard">أول رقم قياسي ينتظر لاعب اليوم</p>
      ) : (
        <ol>
          {topFive.map((result, index) => (
            <li className={result.id === highlightId ? "current" : ""} key={result.id}>
              <span>{index + 1}</span>
              <b>{result.name}</b>
              <strong>{result.score.toLocaleString("en-US")}</strong>
              <small>{formatDate(result.createdAt)}</small>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TimerRing({ secondsLeft }: { secondsLeft: number }) {
  const angle = (secondsLeft / ROUND_SECONDS) * 360;
  return (
    <div className="timer" style={{ "--angle": `${angle}deg` } as CSSProperties}>
      <span>{secondsLeft.toLocaleString("en-US")}</span>
      <b>ثانية</b>
    </div>
  );
}

function ProductPack({
  product,
  compact = false,
  animated = false,
}: {
  product: Product;
  compact?: boolean;
  animated?: boolean;
}) {
  const isBoard = !compact;
  
  if (isBoard && product.cutout) {
    return (
      <div
        className={`productPack ${product.id} ${product.vessel} cutout3d ${animated ? "animated" : ""}`}
        style={{ animationDelay: `${Math.random() * 0.4}s` }}
      >
        <img className="productCutout" src={product.cutout} alt={product.name} draggable={false} />
      </div>
    );
  }

  return (
    <div
      className={`productPack ${product.id} ${product.vessel} ${product.image ? "hasPhoto" : "brandBuilt"} ${product.imageMode ?? ""} ${compact ? "compact" : ""} ${animated ? "animated" : ""}`}
      style={
        {
          "--pack": product.color,
          "--accent": product.accent,
        } as CSSProperties
      }
    >
      {product.image ? (
        <>
          <img className="productPhoto" src={product.image} alt={product.name} draggable={false} />
          <div className="photoCaption">
            <strong>{product.name}</strong>
            <span>{product.english}</span>
          </div>
        </>
      ) : (
        <>
          <div className="packCap" />
          <div className="packLabel">
            <OfficialLogo small />
            <span className="productEmoji" style={{ fontSize: "24px", margin: "4px 0" }}>
              {product.icon}
            </span>
            <strong>{product.name}</strong>
            <span>{product.english}</span>
          </div>
          <div className="packWindow">
            {product.ingredients.map((ingredientId) => (
              <i key={ingredientId} style={{ background: ingredientById.get(ingredientId)!.tone }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function IngredientGlyph({ ingredient }: { ingredient: Ingredient }) {
  return (
    <i className="emojiGlyph" style={{ "--tone": ingredient.tone } as CSSProperties}>
      <span className="nativeEmoji">{ingredient.icon}</span>
    </i>
  );
}

function OfficialLogo({ small = false }: { small?: boolean }) {
  return (
    <span className={`officialLogo ${small ? "small" : ""}`}>
      <img src="brand/products/logo-full.png" alt="Rawabi Farah" draggable={false} />
    </span>
  );
}

function AmbientScene() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="sunWash" />
      <div className="fieldLines">
        {Array.from({ length: 12 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      <div className="woodCounter" />
    </div>
  );
}

type ErrorBoundaryProps = { children: ReactNode };
type ErrorBoundaryState = { hasError: boolean };

class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[Rawabi Game Error]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "grid", placeItems: "center", minHeight: "100vh",
          background: "#0c321f", color: "#fffaf0", fontFamily: "inherit",
          textAlign: "center", padding: "24px",
        }}>
          <div>
            <h2 style={{ fontSize: "28px", marginBottom: "12px" }}>حدث خطأ غير متوقع</h2>
            <p style={{ opacity: 0.8, marginBottom: "20px" }}>يرجى إعادة تحميل الصفحة</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "12px 32px", fontSize: "16px", fontWeight: 800,
                color: "#0c321f", background: "#c49a42", border: "none",
                borderRadius: "8px", cursor: "pointer",
              }}
            >
              إعادة تحميل
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function WrappedApp() {
  return (
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  );
}
