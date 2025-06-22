"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Play } from "lucide-react"

interface GameRoom {
  id: string
  name: string
  creator: string
  players: number
  maxPlayers: number
  status: "waiting" | "playing" | "finished"
}

export default function HomePage() {
  const [rooms, setRooms] = useState<GameRoom[]>([])
  const [playerName, setPlayerName] = useState("")
  const [roomName, setRoomName] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    // 방 목록 로드
    loadRooms()

    // 10초마다 방 목록 새로고침 (5초에서 10초로 변경)
    const interval = setInterval(loadRooms, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadRooms = async () => {
    try {
      const response = await fetch("/api/rooms")
      if (response.ok) {
        const data = await response.json()
        setRooms(data.rooms || [])
      }
    } catch (error) {
      console.error("방 목록 로드 실패:", error)
    }
  }

  const createRoom = async () => {
    if (!playerName.trim() || !roomName.trim() || isCreating) return

    setIsCreating(true)
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName, playerName }),
      })

      if (response.ok) {
        const data = await response.json()
        setIsCreateDialogOpen(false)
        setRoomName("")
        window.location.href = `/game/${data.roomId}?player=${encodeURIComponent(playerName)}`
      } else {
        const error = await response.json()
        alert(error.error || "방 생성에 실패했습니다")
      }
    } catch (error) {
      console.error("방 생성 실패:", error)
      alert("방 생성에 실패했습니다")
    } finally {
      setIsCreating(false)
    }
  }

  const joinRoom = (roomId: string) => {
    if (!playerName.trim()) {
      alert("플레이어 이름을 입력해주세요!")
      return
    }
    window.location.href = `/game/${roomId}?player=${encodeURIComponent(playerName)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">♔ 온라인 체스 ♛</h1>
          <p className="text-gray-600">친구와 함께 체스를 즐겨보세요!</p>
        </div>

        <div className="mb-6">
          <Label htmlFor="playerName" className="text-lg font-medium">
            플레이어 이름
          </Label>
          <Input
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="이름을 입력하세요"
            className="mt-2"
          />
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">게임 방 목록</h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />방 만들기
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 게임 방 만들기</DialogTitle>
                <DialogDescription>체스 게임을 위한 새로운 방을 만들어보세요.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="roomName">방 이름</Label>
                  <Input
                    id="roomName"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="방 이름을 입력하세요"
                  />
                </div>
                <Button onClick={createRoom} className="w-full" disabled={isCreating}>
                  {isCreating ? "생성 중..." : "방 만들기"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">아직 생성된 방이 없습니다.</p>
              <p className="text-gray-400">첫 번째 방을 만들어보세요!</p>
            </div>
          ) : (
            rooms.map((room) => (
              <Card key={room.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {room.name}
                    <Badge
                      variant={
                        room.status === "waiting" ? "default" : room.status === "playing" ? "secondary" : "outline"
                      }
                    >
                      {room.status === "waiting" ? "대기중" : room.status === "playing" ? "게임중" : "완료"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>방장: {room.creator}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      {room.players}/{room.maxPlayers}
                    </div>
                    <Button
                      onClick={() => joinRoom(room.id)}
                      disabled={room.players >= room.maxPlayers || room.status !== "waiting"}
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      참가하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
