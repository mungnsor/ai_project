"use client";
import React from "react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { StarIcon } from "../icons/starIcon";
import { RefreshIcon } from "../icons/refreshIcon";
import { NoteIcon } from "../icons/noteIcon";
import { ImageIcon } from "../icons/imageIcon";
import { TrashIcon } from "../icons/trashIcon";
import { ChatIcon } from "../icons/chatIcon";
import { SendIcon } from "lucide-react";
interface Message {
  role: "user" | "assistant";
  content: string;
}
export const ImageAnalysis = () => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [text, setText] = useState("");
  const [showText, setShowText] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState(false);
  const [input, setInput] = useState("");
  const [spin, setSpin] = useState(false);

  const handleRefresh = () => {
    setSpin(true);
    setTimeout(() => {
      setSpin(false);
      window.location.reload();
    }, 600);
  };
  const handleRemoveInput = () => {
    setImgUrl(null);
    setFile(null);
  };
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setImgUrl(URL.createObjectURL(uploadedFile));
  };
  const handleDetect = async () => {
    if (!file) return;
    setLoading(true);
    setResult([]);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/detect", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setResult(data.objects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setImageUrl(null);

    try {
      const data = await (
        await fetch("/apii/detection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        })
      ).json();

      if (data.error) {
        console.error(data.error);
      } else if (data.image) {
        setImageUrl(data.image);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleGenreText = async () => {
    if (!text) return;

    setLoading(true);

    try {
      const res = await fetch("/key/textdetect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      console.log(data, "hehee");
      setShowText(data.text.candidates[0].content.parts[0].text);

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      setResponse(data.text);
    } catch (error) {
      console.error("Error:", error);
      setResponse("Failed to generate response.");
    } finally {
      setLoading(false);
    }
  };
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("/chat/detects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat: userMessage }),
      });

      const data = await response.json();

      if (data.err) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${data.err}` },
        ]);
      } else if (data.text) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.text },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${err}` },
      ]);
    } finally {
      setLoading(false);
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  return (
    <div className="flex  w-full h-full justify-end ">
      <div className="w-145 h-222 flex  ">
        <div className="w-full h-full mt-10">
          <Tabs defaultValue="account">
            <TabsList className="w-125 h-9">
              <TabsTrigger value="account">Image analysis</TabsTrigger>
              <TabsTrigger value="password">Ingredient recognition</TabsTrigger>
              <TabsTrigger value="pass">Image creator</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <Card className="h-250 w-145  ">
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <div className="flex gap-2 items-center">
                      <StarIcon />
                      Image analysis
                    </div>
                    <button
                      className="w-12 h-10 border border-gray-200 flex justify-center items-center rounded-lg"
                      onClick={handleRefresh}
                    >
                      <RefreshIcon />
                    </button>
                  </CardTitle>

                  <CardDescription>
                    Upload a food photo, and AI will detect the ingredients.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-3">
                  <div className="rounded-lg flex justify-start items-start relative w-52 max-h-[141px]">
                    {imgUrl && (
                      <>
                        <img
                          src={imgUrl}
                          alt="preview"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <button
                          onClick={handleRemoveInput}
                          className="flex justify-center items-center bg-white w-8 h-8 cursor-pointer rounded-lg absolute right-4 bottom-4"
                        >
                          <TrashIcon />
                        </button>
                      </>
                    )}
                    {!imgUrl && (
                      <input
                        type="file"
                        accept="image/*"
                        className="border rounded-lg h-10 cursor-pointer"
                        onChange={handleImageUpload}
                      />
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <button
                    className="w-23.5 h-10 bg-black rounded-2xl text-white"
                    onClick={handleDetect}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Generate"}
                  </button>
                </CardFooter>
                <CardTitle className="flex ml-5 mt-5">
                  <div className="flex gap-2 items-center">
                    <NoteIcon />
                    Here is the summary
                  </div>
                </CardTitle>
                <CardDescription className="flex ml-5">
                  <textarea
                    className="w-125 rounded-sm border"
                    placeholder="First, enter your text to recognize an ingredients."
                    value={(result || [])
                      .map((cur: { label: string }) => cur.label)
                      .join(", ")}
                    readOnly
                  />
                </CardDescription>
              </Card>
            </TabsContent>
            <TabsContent value="password">
              <Card className="w-145 h-250 ">
                <CardHeader>
                  <CardTitle className="flex justify-between ">
                    <div className="flex gap-2 items-center">
                      <StarIcon />
                      Ingredient recognition{" "}
                    </div>
                    <div>
                      <button
                        className="w-12 h-10 border border-gray-200 flex justify-center items-center rounded-lg"
                        onClick={handleRefresh}
                      >
                        <RefreshIcon />{" "}
                      </button>{" "}
                    </div>{" "}
                  </CardTitle>{" "}
                  <CardDescription>
                    Describe the food, and AI will detect the ingredients.{" "}
                  </CardDescription>{" "}
                </CardHeader>{" "}
                <CardContent className="grid gap-6">
                  {" "}
                  <div className="grid gap-3">
                    <textarea
                      id="tabs-demo-current"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                  </div>{" "}
                </CardContent>{" "}
                <CardFooter className="flex justify-end">
                  {" "}
                  <button
                    className="w-23.5 h-10 bg-black rounded-2xl text-white"
                    onClick={handleGenreText}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Generate"}
                  </button>{" "}
                </CardFooter>{" "}
                <CardTitle className="flex ml-5">
                  <div className="flex gap-2 items-center">
                    <NoteIcon />
                    Identified Ingredients
                  </div>
                </CardTitle>
                <CardDescription className="flex ml-5">
                  <div className="w-125 rounded-sm">{showText}</div>
                </CardDescription>
              </Card>
            </TabsContent>
            <TabsContent value="pass">
              <Card className="w-145 h-250 ">
                <CardHeader>
                  <CardTitle className="flex justify-between ">
                    <div className="flex gap-2 items-center">
                      <StarIcon />
                      Food image creator
                    </div>
                    <div>
                      <button
                        className="w-12 h-10 border border-gray-200 flex justify-center items-center rounded-lg"
                        onClick={handleRefresh}
                      >
                        <RefreshIcon />
                      </button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    <p>What do you want? Describe it briefly.</p>
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid gap-3">
                    <Input
                      id="tabs-demo-current"
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <button
                    className="w-23.5 h-10 bg-black rounded-2xl text-white"
                    onClick={handleGenerate}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Generate"}
                  </button>
                </CardFooter>
                <CardTitle className="flex ml-5">
                  <div className="flex gap-2 items-center">
                    <ImageIcon />
                    Result
                  </div>
                </CardTitle>
                <CardDescription className="flex ml-5">
                  <div className="rounded-lg flex justify-start items-start relative w-[300px] h-[200px]">
                    {imageUrl && (
                      <div className="">
                        <img
                          src={imageUrl}
                          alt="Generated"
                          className="w-62 max-h-[172px] rounded-lg shadow-lg"
                        />
                      </div>
                    )}
                  </div>
                </CardDescription>
              </Card>
            </TabsContent>
          </Tabs>
        </div>{" "}
      </div>{" "}
      <div className="flex  justify-end  w-[750px] items-end h-250 mr-10 mt-24">
        {!chat && (
          <button
            className="w-11 h-11 bg-black rounded-full justify-center items-center flex "
            onClick={() => setChat(true)}
          >
            <ChatIcon />
          </button>
        )}
        {chat && (
          <div className="flex flex-col max-w-lg mx-auto p-4 border border-gray-200 rounded-2xl max-h-screen absolute ">
            <div className="flex justify-between">
              <h1 className="text-xl font-bold mb-4"> Chat assistant</h1>
              <button
                className="w-9 h-9 rounded-lg border border-gray-200"
                onClick={() => setChat(false)}
              >
                x
              </button>
            </div>
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  Start a conversation by typing a message below
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-black text-white w-11 h-11 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
